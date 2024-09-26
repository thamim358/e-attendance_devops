from collections import defaultdict
from datetime import date, datetime, timezone
import logging
import time
from flask import current_app, request
from sqlalchemy import and_, case, func
import sqlalchemy
from config.db import db
from models.psb.batch_job import BatchJob
from models.psb.ica_course import CourseMasterTemp
from models.smart_gantry.employee import SmartGantryEmployees
from models.smart_gantry.smart_gantry_student import SmartGantryStudents
from models.sms.sms_cv001_view import SMS_CV001_View
from models.sms.sms_f7_view import SMS_F7_View
from dateutil import parser
from utils.batch_job.retry import retry
from utils.batch_job.jobs_utils import (
    construct_context_identifier,
    construct_module_based_attendance,
    fetch_data,
    get_current_modules,
    process_checkins,
)
from utils.common.attendance_entry import attendance_entry
from dateutil.tz import tzutc

from utils.common.general import (
    convert_to_sql_server_datetime,
    date_to_ms_timestamp,
    parse_date,
    parse_student_dob,
    remove_hyphens_context_identifier,
)

log = logging.getLogger("psb_academy_logger")


def fetch_common_data():
    students = {s.employee_id: s for s in SmartGantryStudents.query.all()}
    employees = {e.id: e for e in SmartGantryEmployees.query.all()}

    course_details = defaultdict(list)
    for detail in (
        SMS_CV001_View.query.filter(
            SMS_CV001_View.enrollment_status == "Enrolled"
        )
        .with_entities(
            SMS_CV001_View.user_name,
            SMS_CV001_View.course_code,
            SMS_CV001_View.course_cohort_batch_name,
        )
        .all()
    ):
        course_details[detail.user_name].append(
            {
                "course_code": detail.course_code,
                "cohort_name": detail.course_cohort_batch_name,
            }
        )

    module_info = {}
    current_date = datetime(2024, 8, 14).date()
    # current_date = datetime.now().date()

    # Convert two-digit year to four-digit year
    def convert_two_digit_year(date_str):
        return func.concat(
            func.substr(date_str, 1, 7),
            case(
                (
                    func.cast(func.substr(date_str, 8, 2), sqlalchemy.Integer)
                    > 50,
                    "19",
                ),
                else_="20",
            ),
            func.substr(date_str, 8, 2),
        )

    query = SMS_F7_View.query.filter(
        and_(
            SMS_F7_View.module_status == "OPTED",
            func.str_to_date(
                convert_two_digit_year(SMS_F7_View.module_start_date),
                "%d-%b-%Y",
            )
            <= func.cast(current_date, sqlalchemy.Date),
            func.str_to_date(
                convert_two_digit_year(SMS_F7_View.module_end_date), "%d-%b-%Y"
            )
            >= func.cast(current_date, sqlalchemy.Date),
        )
    )

    for module in query.all():
        module_info[module.module_code] = module

    # Filter CV001 view for 'Enrolled' status in enrollment details
    enrollment_details = defaultdict(dict)
    for detail in (
        SMS_CV001_View.query.filter(
            SMS_CV001_View.enrollment_status == "Enrolled"
        )
        .with_entities(
            SMS_CV001_View.user_name,
            SMS_CV001_View.course_code,
            SMS_CV001_View.enrollment_id,
            SMS_CV001_View.enrollment_status,
            SMS_CV001_View.nationality,
            SMS_CV001_View.domicile,
            SMS_CV001_View.date_of_birth,
            SMS_CV001_View.email,
        )
        .all()
    ):
        enrollment_details[detail.user_name][detail.course_code] = {
            "enrollment_id": detail.enrollment_id,
            "enrollment_status": detail.enrollment_status,
            "nationality": detail.nationality,
            "domicile": detail.domicile,
            "date_of_birth": detail.date_of_birth,
            "email": detail.email,
        }
    course_types = {
        c.course_code: c.schedule_type
        for c in CourseMasterTemp.query.with_entities(
            CourseMasterTemp.course_code, CourseMasterTemp.schedule_type
        ).all()
    }

    return {
        "students": students,
        "employees": employees,
        "course_details": course_details,
        "module_info": module_info,
        "enrollment_details": enrollment_details,
        "course_types": course_types,
    }


@retry(max_attempts=3, delay=1)
def process_batchjob_data(gantry_data, type, gantry_data_list, common_data):
    errors = []
    try:
        username = None
        employee_id = None

        if type == "gantry":
            employee_id = gantry_data.get("employee_id")
            if not employee_id:
                return None, "No employee_id found for this data", None

            student = common_data["students"].get(employee_id)
            if not student:
                return None, "No student record found", None

            username = student.student_id
            course_info = common_data["course_details"].get(username, [])
            if not course_info:
                return None, "No course found for the student", username

        elif type == "blackboard":
            username = gantry_data.get("username", "").upper()
            if not username:
                return None, "No username found for this data", None
            course_info = common_data["course_details"].get(username, [])
            if not course_info:
                return None, "No course found for the student", username
        else:
            return None, f"Invalid type: {type}", None

        log.info(f"Processing attendance for username: {username}")

        for course in course_info:
            course_code = course["course_code"]
            cohort_name = course["cohort_name"]
            current_modules = get_current_modules(course_code)
            if not current_modules:
                errors.append(
                    f"No current modules found for the course {course_code}"
                )
            else:
                for current_module in current_modules:
                    module_info = common_data["module_info"].get(
                        current_module
                    )
                    if not module_info:
                        errors.append(
                            f"No module information found for {current_module}"
                        )
                    else:
                        module_code = module_info.module_code
                        university_code = module_info.university_code
                        log.info(
                            f"Processing module: {module_code} for university: {university_code}"
                        )

                        enrollment_detail = (
                            common_data["enrollment_details"]
                            .get(username, {})
                            .get(course_code, {})
                        )
                        if not enrollment_detail:
                            errors.append(
                                f"No enrollment details found for {username} in course {course_code}"
                            )
                        else:
                            dob = enrollment_detail.get("date_of_birth")
                            formatted_date = (
                                parser.parse(dob).strftime("%Y-%m-%d")
                                if dob
                                else None
                            )

                            module_start_date = parse_date(
                                module_info.module_start_date
                            )
                            parsed_start_date = (
                                remove_hyphens_context_identifier(
                                    str(module_start_date)
                                )
                            )
                            course_type = common_data["course_types"].get(
                                course_code
                            )
                            context_identifier = construct_context_identifier(
                                current_module, parsed_start_date, course_type
                            )
                            log.info(
                                f"Context identifier: {context_identifier}"
                            )

                            student_attendance_obj = process_checkins(
                                username, gantry_data_list, type, employee_id
                            )
                            if not student_attendance_obj.get(
                                "attendance_date"
                            ):
                                errors.append(
                                    "Error in student check-in and check-out times"
                                )
                            else:
                                try:
                                    module_attendance = (
                                        construct_module_based_attendance(
                                            context_identifier,
                                            student_attendance_obj,
                                            university_code,
                                        )
                                    )

                                    if (
                                        module_attendance
                                        and module_attendance.get("join_time")
                                        and module_attendance.get("leave_time")
                                    ):
                                        module_attendance.update(
                                            {
                                                "student_email": enrollment_detail.get(
                                                    "email"
                                                ),
                                                "student_name": gantry_data.get(
                                                    "employee_name"
                                                ),
                                                "student_id": username,
                                                "module_id": module_code,
                                                "enrollment_id": enrollment_detail.get(
                                                    "enrollment_id"
                                                ),
                                                "enrollment_status": "OPTED",
                                                "country_name": enrollment_detail.get(
                                                    "nationality"
                                                ),
                                                "attendance_type": type,
                                                "course_code": course_code,
                                                "course_cohort_name": cohort_name,
                                                "student_dob": formatted_date,
                                                "domicile": enrollment_detail.get(
                                                    "domicile"
                                                ),
                                                "created_by": "batch_job",
                                                "created_at": convert_to_sql_server_datetime(
                                                    datetime.now(timezone.utc)
                                                ),
                                            }
                                        )
                                        log.info(
                                            f"Successfully generated attendance data for {username} in module {module_code}"
                                        )
                                        return (
                                            module_attendance,
                                            None,
                                            username,
                                        )
                                except ValueError as e:
                                    errors.append(str(e))

        if errors:
            return None, "; ".join(errors), username
        else:
            return None, "No attendance data generated", username

    except Exception as e:
        log.error(f"Unexpected error in process_batchjob_data: {str(e)}")
        return None, f"Unexpected error: {str(e)}", username


# This method process the entire data structure for gantry which we send to util method to process the remaining dat
# def load_gantry_data(type):
def load_batchjob_data():
    # log.info(f"{job_type} starting")
    job_type = "gantry"
    with current_app.app_context():
        try:
            failed_reports = []
            succeeded_reports = []
            retry_queue = []
            batch_start_time = datetime.now(tzutc())
            retry_data = request.get_json() if request.data else None
            retry_type = retry_data.get("retry_type") if retry_data else None
            retry_date = retry_data.get("retry_date") if retry_data else None

            # current_date = datetime.now(tzutc()).date()
            current_date = date(2024, 8, 14)
            start_of_day_ms = date_to_ms_timestamp(current_date)
            end_of_day_ms = start_of_day_ms + (24 * 60 * 60 * 1000) - 1
            log.info("start_of_day_ms %s", start_of_day_ms)
            log.info("end_of_day_ms %s", end_of_day_ms)
            # TODO : Fetch only the students for a particular day from gantry
            common_data = fetch_common_data()

            try:
                gantry_data_list = fetch_data(
                    job_type,
                    start_of_day_ms,
                    end_of_day_ms,
                    retry_type,
                    retry_date,
                )
                if retry_type:
                    job_type = retry_type

                log.info("gantry_data_list %s", len(gantry_data_list))
            except Exception as e:
                failed_reports.append(
                    {
                        "employee_id": "N/A",
                        "reason": f"Error fetching {job_type} data: {str(e)}",
                    }
                )
                current_app.logger.error(
                    f"Error fetching {job_type} data: {str(e)}"
                )
                return

            attendance_list_data = []

            for gantry_data in gantry_data_list:
                start_time = time.time()
                try:
                    result, error, username = process_batchjob_data(
                        gantry_data, job_type, gantry_data_list, common_data
                    )

                    if result:
                        attendance_list_data.append(result)
                        succeeded_reports.append(
                            {"student_id": username if username else None}
                        )
                    elif error:
                        failed_reports.append(
                            {
                                "employee_id": (
                                    gantry_data.get("employee_id", "Unknown")
                                    if job_type == "gantry"
                                    else None
                                ),
                                "student_id": username if username else None,
                                "reason": error,
                            }
                        )
                except Exception as e:
                    log.error(
                        f"Unexpected error in main processing loop: {str(e)}"
                    )
                    retry_queue.append(gantry_data)
                finally:
                    end_time = time.time()
                    processing_time = end_time - start_time
                    log.info(f"Processing time: {processing_time:.3f} seconds")

            for gantry_data in retry_queue:
                start_time = time.time()
                try:
                    result, error, username = process_batchjob_data(
                        gantry_data, job_type, gantry_data_list, common_data
                    )
                    if result:
                        attendance_list_data.append(result)
                        succeeded_reports.append(
                            {"student_id": username if username else None}
                        )
                    else:
                        failed_reports.append(
                            {
                                "employee_id": (
                                    gantry_data.get("employee_id", "Unknown")
                                    if job_type == "gantry"
                                    else None
                                ),
                                "student_id": username if username else None,
                                "reason": error,
                            }
                        )
                except Exception as e:
                    failed_reports.append(
                        {
                            "employee_id": (
                                gantry_data.get("employee_id", "Unknown")
                                if job_type == "gantry"
                                else gantry_data.get("username", "Unknown")
                            ),
                            "student_id": username if username else None,
                            "reason": error,
                        }
                    )
                finally:
                    end_time = time.time()
                    processing_time = end_time - start_time
                    log.info(
                        f"Retry processing time: {processing_time:.3f} seconds"
                    )

            log.info(f"failed_reports are {failed_reports}")

            construct_gantry_attendance_data(
                attendance_list_data,
                failed_reports,
                succeeded_reports,
                batch_start_time,
                current_date,
                job_type,
            )

            current_app.logger.info(
                f"{job_type} batch job completed successfully. "
                f"Processed {len(attendance_list_data)} records. "
                f"Failed: {len(failed_reports)}, Succeeded: {len(succeeded_reports)}"
            )

        except Exception as e:
            current_app.logger.error(
                f"An error occurred in {job_type} load_data: {str(e)}"
            )


def construct_gantry_attendance_data(
    attendance_list_data,
    failed_reports,
    succeeded_reports,
    batch_start_time,
    current_date,
    job_type,
):
    try:
        log.info("attendance_list_data %s", attendance_list_data)
        if attendance_list_data and len(attendance_list_data) > 0:
            attendance_entry_process = attendance_entry(
                attendance_list_data,
                failed_reports,
                succeeded_reports,
                batch_start_time,
                current_date,
                job_type,
            )
            current_app.logger.info(
                f"Successfully constructed attendance data for {job_type}"
            )
        else:
            current_app.logger.warning(
                f"No attendance data to process for {job_type}"
            )

            batch_end_time = datetime.now(tzutc())
            current_timestamp = datetime.now(timezone.utc)
            formatted_date = current_timestamp.strftime("%y-%m-%d")
            batchjob_name = f"{job_type}_Batch_Job_{formatted_date}"

            new_audit_log = BatchJob(
                batchjob_name=batchjob_name,
                batchjob_start_time=batch_start_time.strftime(
                    "%Y-%m-%dT%H:%M:%S.%f"
                )[:-3]
                + "Z",
                batchjob_end_time=batch_end_time.strftime(
                    "%Y-%m-%dT%H:%M:%S.%f"
                )[:-3]
                + "Z",
                batchjob_date=current_date.strftime("%Y-%m-%dT00:00:00.000Z"),
                failed_reports=failed_reports,
                batch_job_status="Failed",
                created_at=current_timestamp,
                created_by="batch_job",
                last_modified_at=current_timestamp,
                last_modified_by="batch_job",
            )
            db.session.add(new_audit_log)
            db.session.commit()

    except Exception as e:
        current_app.logger.error(
            f"An error occurred while constructing {job_type} attendance data: {str(e)}"
        )

        batch_end_time = datetime.now(tzutc())
        current_timestamp = datetime.now(timezone.utc)
        formatted_date = current_timestamp.strftime("%y-%m-%d")
        batchjob_name = f"{job_type}_Batch_Job_{formatted_date}"

        new_audit_log = BatchJob(
            batchjob_name=batchjob_name,
            batchjob_start_time=batch_start_time.strftime(
                "%Y-%m-%dT%H:%M:%S.%f"
            )[:-3]
            + "Z",
            batchjob_end_time=batch_end_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[
                :-3
            ]
            + "Z",
            batchjob_date=current_date.strftime("%Y-%m-%dT00:00:00.000Z"),
            failed_reports=failed_reports,
            batch_job_status="Failed",
            created_at=current_timestamp,
            created_by="batch_job",
            last_modified_at=current_timestamp,
            last_modified_by="batch_job",
        )
        db.session.add(new_audit_log)
        db.session.commit()

        current_app.logger.error("An error occurred during attendance entry.")

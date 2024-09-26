from datetime import date, datetime, timezone
from dateutil.tz import tzutc


from flask import current_app, jsonify
from models.psb.batch_job import BatchJob
from config.db import db
import logging

from models.psb.attendance import Attendance
from models.rdb.splus_activities import SPlusActivities
from models.smart_gantry.smart_gantry_student import SmartGantryStudents
from utils.common.attendance_tracker import student_attendance_status
from utils.common.general import (
    construct_module_time,
    convert_to_sql_server_datetime,
    duration_to_minutes,
    remove_hyphens_context_identifier,
    send_sms,
)

log = logging.getLogger("psb_academy_logger")


def attendance_entry(
    data_array,
    failed_reports,
    succeeded_reports,
    batch_start_time,
    current_date,
    job_type,
):
    current_timestamp = datetime.now(timezone.utc)
    formatted_date = current_timestamp.strftime("%y-%m-%d")
    batchjob_name = f"{job_type}_Batch_Job_{formatted_date}"
    batch_end_time = datetime.now(tzutc())
    status = None

    try:
        total_items = len(data_array)
        failed_items = 0
        log.info("total_items %s", total_items)
        for data in data_array:
            try:
                join_time = (
                    datetime.strptime(data["join_time"], "%Y-%m-%d %H:%M:%S")
                    if data["join_time"]
                    else None
                )
                leave_time = (
                    datetime.strptime(data["leave_time"], "%Y-%m-%d %H:%M:%S")
                    if data["leave_time"]
                    else None
                )
                created_at = (
                    datetime.strptime(data["created_at"], "%Y-%m-%d %H:%M:%S")
                    if data["created_at"]
                    else datetime.utcnow()
                )

                new_attendance = Attendance(
                    attendance_type=data.get("attendance_type"),
                    student_id=data.get("student_id"),
                    student_name=data.get("student_name"),
                    attendance_status=data.get("attendance_status"),
                    join_time=join_time,
                    leave_time=leave_time,
                    total_time=data.get("total_time"),
                    module_id=data.get("module_id"),
                    country_name=data.get("country_name"),
                    enrollment_id=data.get("enrollment_id"),
                    enrollment_status=data.get("enrollment_status"),
                    context_identifier=data.get("context_identifier"),
                    student_email=data.get("student_email"),
                    created_at=created_at,
                    created_by=data.get("created_by"),
                    course_code=data.get("course_code"),
                    course_cohort_name=data.get("course_cohort_name"),
                    student_dob=data.get("student_dob"),
                    domicile=data.get("domicile"),
                    activity_name=data.get("original_activity_name"),
                )
                db.session.add(new_attendance)
                db.session.commit()
                current_app.logger.info(
                    f"Successfully inserted attendance for student {data.get('student_id')}"
                )
                succeeded_reports.append(
                    {"student_id": data.get("student_id")}
                )
            except Exception as e:
                failed_items += 1
                failed_reports.append(
                    {
                        "student_id": data.get("student_id"),
                        "reason": f"Error processing data during db operation: {str(e)}",
                    }
                )
                current_app.logger.error(
                    f"Failed to update attendance: {str(e)}"
                )

        status = "Failure" if failed_items == total_items else "Success"

    except Exception as e:
        current_app.logger.error(
            f"An error occurred during attendance entry: {e}"
        )
        status = "Failure"
        db.session.rollback()

    finally:
        log.info("batchjob database entry on")
        log.info(f"failed reports are {failed_reports}")

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
            batch_job_status=status,
            created_at=current_timestamp,
            created_by="batch_job",
            last_modified_at=current_timestamp,
            last_modified_by="batch_job",
        )
        db.session.add(new_audit_log)
        db.session.commit()

        if status == "Success":
            current_app.logger.info(
                f"Database population completed. Succeeded: {len(succeeded_reports)}, Failed: {len(failed_reports)}"
            )
        else:
            current_app.logger.error(
                "An error occurred during attendance entry."
            )

    message = f"Attendance Entry Job: {status}. Succeeded: {len(succeeded_reports)}, Failed: {len(failed_reports)}"
    send_sms(message)
    return {
        "status": status,
        "succeeded": len(succeeded_reports),
        "failed": len(failed_reports),
    }

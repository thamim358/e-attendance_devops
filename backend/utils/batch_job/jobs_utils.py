from io import StringIO
from datetime import date, datetime, time
import json
import logging

import pandas as pd
import pytz
import requests
from sqlalchemy import and_, distinct

from models.rdb.splus_activities import SPlusActivities
from models.smart_gantry.gantry_view import PsbGantryView
from models.smart_gantry.smart_gantry_student import SmartGantryStudents
from models.sms.sms_f7_view import SMS_F7_View
from config.db import db
from utils.batch_job.jobs_failure_retries import job_retries
from utils.blackboard.auth import bb_auth
from utils.common.attendance_tracker import student_attendance_status
from utils.common.general import (
    construct_module_time,
    convert_to_24h,
    convert_to_sgt,
    convert_to_sql_server_datetime,
    date_to_ms_timestamp,
    duration_to_minutes,
    epoch_to_date,
    epoch_to_time,
    parse_date,
    remove_hyphens_context_identifier,
    time_str_to_time,
)
from utils.config.secrets import get_secrets

log = logging.getLogger("psb_academy_logger")


# Fetches modules which falls on the current date
def get_current_modules(course_code):
    # current_date = datetime.now().date()
    current_date = datetime(2024, 8, 14).date()

    query = db.session.query(
        distinct(SMS_F7_View.module_code),
        SMS_F7_View.module_start_date,
        SMS_F7_View.module_end_date,
    ).filter(SMS_F7_View.course_code == course_code)

    results = query.all()

    current_modules = []
    for module_code, start_date_str, end_date_str in results:
        if start_date_str and end_date_str:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)

            if start_date <= current_date <= end_date:
                current_modules.append(module_code)

    return current_modules


# This method constructs the context identifier which is not directly present in gantry table. We construct this using module code, module start date and course type
def construct_context_identifier(
    current_module, parsed_start_date, course_type
):
    modified_current_module = remove_hyphens_context_identifier(current_module)
    # Commenting this out if needed for later purpose
    # course_type_code = None
    # if course_type[0] == "Full Time":
    #     course_type_code = "FT"
    # elif course_type[0] == "Part Time":
    #     course_type_code = "PT"
    # course_type_code = course_type_code if course_type_code is not None else ""

    # current_year = datetime.now().strftime("%Y")
    return modified_current_module
    # return modified_current_module + parsed_start_date


# This method checks if the student start and end time falls between module start and end time
def is_within_schedule(
    check_in, check_out, start, end, context_identifier_details
):
    log.info(
        f"first_join is {check_in} last_leave is {check_out} sch start is {context_identifier_details.Scheduled_Start_Time} sch end is {context_identifier_details.Scheduled_End_Time} for {context_identifier_details}"
    )
    return (
        start <= check_in < end
        or start < check_out <= end
        or (check_in <= start and check_out >= end)
    )


# This method checks for which module the student has attended
def construct_module_based_attendance(
    context_identifier, student_attendance_obj, university_code
):
    if context_identifier:
        log.info(
            f"university_code + context identifier :: {university_code}{context_identifier}"
        )
        current_date = date(2024, 8, 14)
        context_identifier_details = SPlusActivities.query.filter(
            and_(
                SPlusActivities.Module_Host_Key.ilike(
                    f"{university_code}{context_identifier}%"
                ),
                SPlusActivities.Activity_Dates == current_date,
            )
        ).first()

        if context_identifier_details is not None:
            context_identifier = f"{university_code}{context_identifier}"

        if context_identifier_details is None:
            log.info("not matching context_identifier %s", context_identifier)
            context_identifier_details = SPlusActivities.query.filter(
                and_(
                    SPlusActivities.Module_Host_Key.ilike(
                        f"{context_identifier}%"
                    ),
                    SPlusActivities.Activity_Dates == current_date,
                )
            ).first()

        # Below is for testing
        # context_identifier_details = SPlusActivities.query.filter(
        #     SPlusActivities.Module_Host_Key.ilike(f"CU7036MAA2024%"),
        #     SPlusActivities.Activity_Dates == "2024-05-24",
        # ).first()

        if context_identifier_details is None:
            raise ValueError(
                f"Context identifier doesn't match with the module host key. University Code: {university_code}, Context Identifier: {context_identifier}"
            )

        log.info("context_identifier_details %s", context_identifier_details)
        scheduled_start_time = time_str_to_time(
            context_identifier_details.Scheduled_Start_Time
        )
        scheduled_end_time = time_str_to_time(
            context_identifier_details.Scheduled_End_Time
        )
        check_ins = [
            convert_to_24h(t) for t in student_attendance_obj["check_in_times"]
        ]
        check_outs = [
            convert_to_24h(t)
            for t in student_attendance_obj["check_out_times"]
        ]
        start = convert_to_24h(scheduled_start_time)
        end = convert_to_24h(scheduled_end_time)
        attendance_date = student_attendance_obj.get("attendance_date", None)
        attendance_data = {
            "context_identifier": context_identifier,
            "join_time": "",
            "leave_time": "",
            "original_activity_name": context_identifier_details.Original_Activity_Name,
        }

        within_schedule = False
        for check_in, check_out in zip(check_ins, check_outs):
            if is_within_schedule(
                check_in, check_out, start, end, context_identifier_details
            ):
                first_join = (
                    f"{attendance_date} {check_in.strftime('%H:%M:%S')}"
                )
                last_leave = (
                    f"{attendance_date} {check_out.strftime('%H:%M:%S')}"
                )

                schedule_start_time = construct_module_time(
                    time=context_identifier_details.Scheduled_Start_Time,
                    date=context_identifier_details.Activity_Dates,
                    type="schedule",
                )
                schedule_end_time = construct_module_time(
                    time=context_identifier_details.Scheduled_End_Time,
                    date=context_identifier_details.Activity_Dates,
                    type="schedule",
                )

                attendee_join_time = construct_module_time(
                    attendee_time=first_join,
                    type="attendeeTime",
                )
                attendee_leave_time = construct_module_time(
                    attendee_time=last_leave,
                    type="attendeeTime",
                )

                attendance_duration = duration_to_minutes(
                    attendee_join_time, attendee_leave_time
                )

                attendance_status = student_attendance_status(
                    schedule_start_time,
                    schedule_end_time,
                    attendee_join_time,
                    attendee_leave_time,
                )

                if isinstance(attendee_join_time, str):
                    attendee_join_time = datetime.fromisoformat(
                        attendee_join_time.replace("Z", "+00:00")
                    )
                if isinstance(attendee_leave_time, str):
                    attendee_leave_time = datetime.fromisoformat(
                        attendee_leave_time.replace("Z", "+00:00")
                    )

                attendance_data["join_time"] = convert_to_sql_server_datetime(
                    attendee_join_time
                )
                attendance_data["leave_time"] = convert_to_sql_server_datetime(
                    attendee_leave_time
                )
                attendance_data["total_time"] = attendance_duration
                attendance_data["attendance_status"] = attendance_status

                within_schedule = True
                break

        if not within_schedule:
            raise ValueError(
                f"Student check-in and check-out doesn't match with schedule start and end time. University Code: {university_code}, Context Identifier: {context_identifier}"
            )

        return attendance_data

    return None


# This method constructs an object which has student data along with their join and leave times
def process_checkins(
    student_id, gantry_data_list=None, type=None, employee_id=None
):

    log.info(f"student_id is {student_id} employee_id is {employee_id} ")
    result = {
        "student_id": student_id,
        "check_in_times": [],
        "check_out_times": [],
    }

    # Comment out the current_date line
    # current_date = date.today()

    # Use September 15, 2024 instead
    current_date = date(2024, 8, 14)
    start_of_day_ms = date_to_ms_timestamp(current_date)
    end_of_day_ms = start_of_day_ms + (24 * 60 * 60 * 1000) - 1
    log.info("start_of_day_ms %s", start_of_day_ms)
    log.info("end_of_day_ms %s", end_of_day_ms)

    student_details = []

    if type == "gantry":
        student_details = PsbGantryView.query.filter(
            PsbGantryView.employee_id == employee_id,
            PsbGantryView.attendance_date.between(
                start_of_day_ms, end_of_day_ms
            ),
            # ).limit(2).all()
        ).yield_per(100)

    if type == "blackboard":
        if isinstance(gantry_data_list, str):
            data = json.loads(gantry_data_list)
        else:
            data = gantry_data_list

        student_details = [
            record
            for record in data
            if record["username"].upper() == student_id.upper()
        ]

    for student_detail in student_details:
        log.info("student_detail %s", student_detail)

        if type == "gantry":
            employee_id_detail = getattr(
                student_detail, "employee_id", None
            ) or student_detail.get("employee_id")
            log.info("employee_id_detail %s", employee_id_detail)

        if type == "blackboard":
            username = getattr(
                student_detail, "username", None
            ) or student_detail.get("username")

        CHECK_IN_TIME = getattr(
            student_detail, "CHECK_IN_TIME", None
        ) or student_detail.get("CHECK_IN_TIME")
        CHECK_OUT_TIME = getattr(
            student_detail, "CHECK_OUT_TIME", None
        ) or student_detail.get("CHECK_OUT_TIME")

        if (type == "gantry" and employee_id == employee_id_detail) or (
            type == "blackboard" and username.upper() == student_id
        ):
            epoch_check_in_time = CHECK_IN_TIME
            check_in_time = None
            check_out_time = None
            if epoch_check_in_time:
                utc_check_in_time = epoch_to_time(epoch_check_in_time)
                check_in_time = convert_to_sgt(utc_check_in_time)
                log.info(
                    f"utc_check_in_time is {utc_check_in_time} and check_in_time is {check_in_time}"
                )
            epoch_check_out_time = CHECK_OUT_TIME
            if epoch_check_out_time:
                utc_check_out_time = epoch_to_time(epoch_check_out_time)
                check_out_time = convert_to_sgt(utc_check_out_time)
                log.info(
                    f"utc_check_out_time is {utc_check_out_time} and check_out_time is {check_out_time}"
                )

            if epoch_check_in_time and epoch_check_out_time:
                # For attendance_date, we'll use the check-in time
                utc_date = datetime.utcfromtimestamp(
                    epoch_check_in_time / 1000.0
                )
                sgt_date = pytz.UTC.localize(utc_date).astimezone(
                    pytz.timezone("Asia/Singapore")
                )
                log.info(f"utc_date is {utc_date} and sgt_date is {sgt_date}")
                result["attendance_date"] = sgt_date.strftime("%Y-%m-%d")
            if check_in_time:
                result["check_in_times"].append(check_in_time)
            if check_out_time:
                result["check_out_times"].append(check_out_time)

    return result


# This method fetches the csv data from blackboard api
def fetch_attendee_report(start_time, end_time):
    try:
        access_token = bb_auth()

        if not access_token:
            raise ValueError("Failed to obtain access token")

        log.info(f"{start_time} is start and {end_time} is end")
        headers = {"Authorization": f"Bearer {access_token}"}
        secret_value = get_secrets()
        REPORTS_URL = f"{secret_value['BLACKBOARD_REPORTS_URL']}"
        UUID = f"{secret_value['BLACKBOARD_UUID']}"
        data = {
            "uuid": UUID,
            "reportType": "attendee",
            "version": 2085,
            "attributes": {"startTime": start_time, "endTime": end_time},
        }

        response = requests.put(REPORTS_URL, headers=headers, json=data)

        if response.status_code == 409:
            log.warning("Received a 409 Conflict error")
        else:
            response.raise_for_status()

        get_params = {"reportType": "attendee"}
        get_response = requests.get(
            REPORTS_URL, headers=headers, params=get_params
        )

        get_response.raise_for_status()
        get_report_data = get_response.json()

        csv_url = get_report_data.get("url")
        if not csv_url:
            raise ValueError("Failed to obtain CSV URL")

        response = requests.get(csv_url)
        response.raise_for_status()
        csv_content = response.content.decode("utf-8")
        df = pd.read_csv(StringIO(csv_content))

        data_json = df.to_json(orient="records")
        return data_json

    except requests.RequestException as e:
        log.info(f"An error occurred while fetching the data: {str(e)}")
        return None
    except ValueError as e:
        log.info(f"An error occurred: {e}")
        return None


# This method fetches the data for both gantry and blackboard based on the type arg
def fetch_data(
    type, start_of_day_ms, end_of_day_ms, retry_type=None, retry_date=None
):
    try:
        if type == "gantry":
            return fetch_gantry_data(start_of_day_ms, end_of_day_ms)
        elif type == "blackboard":
            return fetch_blackboard_data()
        elif type == "retry":
            return job_retries(type, retry_type, retry_date)
        else:
            raise ValueError("Invalid type specified")
    except Exception as e:
        log.error(f"Error in fetch_data: {str(e)}")
        return []


def fetch_gantry_data(start_of_day_ms, end_of_day_ms):
    try:
        gantry_daily_data = PsbGantryView.query.filter(
            PsbGantryView.attendance_date.between(
                start_of_day_ms, end_of_day_ms
            )
            # ).limit(2).all()
        ).yield_per(100)

        return [
            {
                "employee_name": gantry_data.employee_name,
                "employee_email": gantry_data.employee_email,
                "employee_id": gantry_data.employee_id,
                "CHECK_IN_TIME": gantry_data.CHECK_IN_TIME,
                "CHECK_OUT_TIME": gantry_data.CHECK_OUT_TIME,
                "attendance_date": gantry_data.attendance_date,
                "username": None,
            }
            for gantry_data in gantry_daily_data
        ]
    except Exception as e:
        log.error(f"Error in fetch_gantry_data: {str(e)}")
        return []


def fetch_blackboard_data():
    try:
        current_date = datetime.now().date()
        start_time = datetime.combine(current_date, time.min).strftime(
            "%Y-%m-%dT%H:%M:%S"
        )
        end_time = datetime.combine(current_date, time.max).strftime(
            "%Y-%m-%dT%H:%M:%S"
        )
        log.info(f"{start_time} is start and {end_time} is end")
        # start_time = "2024-08-14T00:00:00"
        # end_time = "2024-08-14T23:59:59"

        gantry_daily_data = fetch_attendee_report(start_time, end_time)
        log.info("gantry_daily_data loaded din blackboard")
        if gantry_daily_data is None:
            log.error("Failed to fetch attendee report")
            return []

        attendees_list = json.loads(gantry_daily_data)[:2]

        return list(filter(None, map(process_attendee, attendees_list)))
    except Exception as e:
        log.error(f"Error in fetch_blackboard_data: {str(e)}")
        return []


def process_attendee(attendee, student_ids=None, type=None):
    try:
        username = str(attendee["Username"]).split("@")[0]

        if (
            type == "retry"
            and student_ids
            and username.upper() not in student_ids
        ):
            return None

        epoch_time_join_ms = parse_datetime(attendee["AttendeeFirstJoinTime"])
        epoch_time_leave_ms = parse_datetime(attendee["AttendeeLastLeaveTime"])

        return {
            "employee_name": attendee["NameOfAttendee"],
            "employee_email": attendee["EmailOfAttendee"],
            "employee_id": None,
            "CHECK_IN_TIME": epoch_time_join_ms,
            "CHECK_OUT_TIME": epoch_time_leave_ms,
            "attendance_date": epoch_time_leave_ms,
            "username": username,
        }

    except Exception as e:
        log.error(f"Error processing attendee: {str(e)}", exc_info=True)
        return None


def parse_datetime(date_string):
    if date_string:
        try:
            dt_object = datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")
            return int(dt_object.timestamp() * 1000)
        except ValueError as e:
            log.error(f"Error parsing datetime: {str(e)}")
    return None

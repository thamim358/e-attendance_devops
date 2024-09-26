from datetime import datetime, timedelta
import json
import time

import logging
from models.psb.batch_job import BatchJob
from models.smart_gantry.gantry_view import PsbGantryView

log = logging.getLogger("psb_academy_logger")


def get_student_ids(data):
    return [item["student_id"] for item in data if "student_id" in item]


def get_employee_ids(data):
    return [item["employee_id"] for item in data if "employee_id" in item]


def job_retries(type, retry_type, date_str):
    # This is imported here to avoid circular imports
    from utils.batch_job.jobs_utils import (
        fetch_attendee_report,
        process_attendee,
    )

    # retry_type = 'blackboard'
    # type = 'retry'
    # date_str = '2024-08-14T00:00:00.000Z'

    date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
    batch_results = (
        BatchJob.query.filter(
            BatchJob.batchjob_date == date_str,
            BatchJob.batchjob_name.startswith(retry_type),
        )
        .order_by(BatchJob.created_at.desc())
        .first()
    )
    failed_reports = batch_results.failed_reports
    student_ids = get_student_ids(failed_reports)
    employee_ids = get_employee_ids(failed_reports)

    if retry_type == "gantry":
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = (
            start_of_day + timedelta(days=1) - timedelta(microseconds=1)
        )
        start_of_day_ms = int(start_of_day.timestamp() * 1000)
        end_of_day_ms = int(end_of_day.timestamp() * 1000)

        gantry_daily_data = PsbGantryView.query.filter(
            PsbGantryView.attendance_date.between(
                start_of_day_ms, end_of_day_ms
            ),
            PsbGantryView.employee_id.in_(employee_ids),
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

    elif retry_type == "blackboard":

        start_time = date.strftime("%Y-%m-%dT00:00:00")
        end_time = (date + timedelta(days=1) - timedelta(seconds=1)).strftime(
            "%Y-%m-%dT23:59:59"
        )
        gantry_daily_data = fetch_attendee_report(start_time, end_time)
        log.info(f"start time is {start_time} and end time is {end_time}")

        if gantry_daily_data is None:
            log.error("Failed to fetch attendee report")
            return []

        attendees_list = json.loads(gantry_daily_data)
        log.info(f"student_ids is {student_ids}")

        filtered_attendees = [
            processed_attendee
            for attendee in attendees_list
            if (
                processed_attendee := process_attendee(
                    attendee, student_ids, type
                )
            )
            is not None
        ]

        log.info(
            f"Processed {len(filtered_attendees)} attendees matching the student IDs"
        )

        return filtered_attendees

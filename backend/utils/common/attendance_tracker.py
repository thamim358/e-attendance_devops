from datetime import datetime, timedelta
import logging

log = logging.getLogger("psb_academy_logger")



def parse_iso8601(time_str):
    return datetime.strptime(time_str, "%Y-%m-%dT%H:%M:%S.%fZ")


def time_to_minutes(dt):
    return dt.hour * 60 + dt.minute


def student_attendance_status(
    course_start_time_str,
    course_end_time_str,
    student_join_time_str,
    student_leave_time_str,
):
    if not all(
        [
            course_start_time_str,
            course_end_time_str,
            student_join_time_str,
            student_leave_time_str,
        ]
    ):
        return "Absent"

    try:
        course_start_time = parse_iso8601(course_start_time_str)
        course_end_time = parse_iso8601(course_end_time_str)
        student_join_time = parse_iso8601(student_join_time_str)
        student_leave_time = parse_iso8601(student_leave_time_str)

        student_duration = (student_leave_time - student_join_time).total_seconds() / 60

        course_duration = (
            course_end_time - course_start_time
        ).total_seconds() / 60

        buffer_duration = 15

        course_actual_duration = course_duration - buffer_duration

        course_actual_start_time = course_start_time + timedelta(
            minutes=buffer_duration
        )

        half_course_duration = course_actual_duration / 2

       
        if student_duration < half_course_duration:
            status = "Absent"

        elif student_join_time > course_actual_start_time and student_duration >= half_course_duration:
            status = "Late"  

        elif student_join_time <= course_actual_start_time and student_duration >= half_course_duration:
            status = "Present"
        
        else:
             log.info("No match the data or time")
    
        return status
        

    except ValueError as ve:
        print(f"Error parsing dates: {ve}")
        return None

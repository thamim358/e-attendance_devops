from datetime import datetime, timedelta
import logging
from flask import request
from flask import make_response, request, jsonify

from sqlalchemy import and_, asc, desc, or_
from sqlalchemy.orm import joinedload
from sqlalchemy import func

# from models.course_master_temp import CourseMasterTemp
from models.psb.module_master_temp import ModuleMasterTemp
from models.psb.ica_course import CourseMasterTemp
from models.sms.sms_cv001_view import SMS_CV001_View
from models.sms.sms_f7_view import SMS_F7_View
from models.psb.course import Course
from models.psb.attendance import Attendance
from models.psb.module import Module


log = logging.getLogger("psb_academy_logger")


from flask import request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import and_


def get_student_attendance_filter():
    try:
        data = request.json
        course_id = data.get("course_id")
        module_id = data.get("module_id")
        attendance_type = data.get("attendance_type")
        student_name = data.get("student_name")
        cohort_name = data.get("cohort_name")
        year = data.get("year")
        month = data.get("month")

        query = Attendance.query
        if course_id:
            query = query.filter(Attendance.course_code == course_id)
        if module_id:
            query = query.filter(Attendance.module_id == module_id)
        if cohort_name:
            query = query.filter(Attendance.course_cohort_name == cohort_name)
        if student_name:
            search_pattern = f"%{student_name}%"
            query = query.filter(
                or_(
                    Attendance.student_name.ilike(search_pattern),
                    Attendance.student_email.ilike(search_pattern),
                    Attendance.enrollment_id.ilike(search_pattern),
                    Attendance.student_id.ilike(search_pattern),
                )
            )
        if attendance_type:
            query = query.filter(Attendance.attendance_type == attendance_type)

        if year and month:
            start_date = datetime(year, month, 1)
            end_date = (
                datetime(year + 1, 1, 1) - timedelta(days=1)
                if month == 12
                else datetime(year, month + 1, 1) - timedelta(days=1)
            )
            query = query.filter(
                Attendance.join_time >= start_date,
                Attendance.leave_time <= end_date,
            )

        attendances = query.all()

        if not attendances:
            return jsonify({"students": [], "total_students": 0}), 200

        log.info("Total attendances count: %d", len(attendances))

        course_codes = {attendance.course_code for attendance in attendances}
        module_codes = {attendance.module_id for attendance in attendances}

        course_titles = dict(
            CourseMasterTemp.query.with_entities(
                CourseMasterTemp.course_code, CourseMasterTemp.course_title
            )
            .filter(CourseMasterTemp.course_code.in_(course_codes))
            .all()
        )
        module_titles = dict(
            ModuleMasterTemp.query.with_entities(
                ModuleMasterTemp.module_code, ModuleMasterTemp.module_title
            )
            .filter(ModuleMasterTemp.module_code.in_(module_codes))
            .all()
        )

        students_dict = {}
        response_list = []

        for attendance in attendances:
            student_id = attendance.student_id
            module_id = attendance.module_id
            unique_key = (student_id, module_id)

            if unique_key not in students_dict:
                student_data = {
                    "student_id": attendance.student_id,
                    "student_name": attendance.student_name,
                    "attendance_status": attendance.attendance_status,
                    "attendance_type": attendance.attendance_type,
                    "context_identifier": attendance.context_identifier,
                    "enrollment_id": attendance.enrollment_id,
                    "enrollment_status": attendance.enrollment_status,
                    "nric_fin": attendance.nric_fin,
                    "course_cohort_name": attendance.course_cohort_name,
                    "country_name": attendance.country_name,
                    "course_code": attendance.course_code,
                    "course_title": course_titles.get(attendance.course_code),
                    "module_title": module_titles.get(attendance.module_id),
                    "student_email": attendance.student_email,
                    "module_id": attendance.module_id,
                    "created_at": attendance.created_at,
                    "created_by": attendance.created_by,
                    "last_modified_at": attendance.last_modified_at,
                    "last_modified_by": attendance.last_modified_by,
                }
                student_attendance_records = [
                    get_attendnce
                    for get_attendnce in attendances
                    if get_attendnce.student_id == student_id
                    and get_attendnce.module_id == module_id
                ]
                attendance_percentage = student_percentage(student_attendance_records)
                student_data["attendance_percentage"] = attendance_percentage
                students_dict[unique_key] = student_data

        response_list = list(students_dict.values())
        response = {
            "students": response_list,
            "total_students": len(response_list),
        }

        return jsonify(response), 200

    except Exception as e:
        log.error("Error processing request: %s", str(e))
        return (
            jsonify({"message": "An error occurred while processing the request."}),
            500,
        )


def get_module_attendance_filter():
    try:
        data = request.json
        school_code = data.get("school_code")
        module_id = data.get("module_id")
        attendance_type = data.get("attendance_type")
        student_name = data.get("student_name")
        cohort_name = data.get("cohort_name")

        query = Attendance.query

        if school_code:
            course_codes_list = (
                CourseMasterTemp.query.filter_by(sbu=school_code)
                .with_entities(CourseMasterTemp.course_code)
                .all()
            )
            course_codes_list = [code[0] for code in course_codes_list]
            query = query.filter(Attendance.course_code.in_(course_codes_list))

        if module_id:
            query = query.filter(Attendance.module_id == module_id)
        if cohort_name:
            query = query.filter(Attendance.course_cohort_name == cohort_name)
        if student_name:
            search_string = f"%{student_name}%"
            query = query.filter(
                (Attendance.student_name.ilike(search_string))
                | (Attendance.student_email.ilike(search_string))
                | (Attendance.enrollment_id.ilike(search_string))
                | (Attendance.student_id.ilike(search_string))
            )
        if attendance_type:
            query = query.filter(Attendance.attendance_type == attendance_type)

        attendances = query.all()
        if not attendances:
            return jsonify({"students": [], "total_students": 0}), 200

        course_codes = {attendance.course_code for attendance in attendances}
        module_codes = {attendance.module_id for attendance in attendances}
        course_titles = dict(
            CourseMasterTemp.query.with_entities(
                CourseMasterTemp.course_code, CourseMasterTemp.course_title
            )
            .filter(CourseMasterTemp.course_code.in_(course_codes))
            .all()
        )
        module_titles = dict(
            ModuleMasterTemp.query.with_entities(
                ModuleMasterTemp.module_code, ModuleMasterTemp.module_title
            )
            .filter(ModuleMasterTemp.module_code.in_(module_codes))
            .all()
        )

        students_dict = {}
        for attendance in attendances:
            student_id = attendance.student_id

            if student_id not in students_dict:
                students_dict[student_id] = {
                    "attendance_id": attendance.attendance_id,
                    "student_id": student_id,
                    "student_name": attendance.student_name,
                    "attendance_status": attendance.attendance_status,
                    "attendance_type": attendance.attendance_type,
                    "context_identifier": attendance.context_identifier,
                    "enrollment_id": attendance.enrollment_id,
                    "enrollment_status": attendance.enrollment_status,
                    "join_time": attendance.join_time,
                    "leave_time": attendance.leave_time,
                    "total_time": attendance.total_time,
                    "nric_fin": attendance.nric_fin,
                    "course_cohort_name": attendance.course_cohort_name,
                    "country_name": attendance.country_name,
                    "course_code": attendance.course_code,
                    "course_title": course_titles.get(attendance.course_code),
                    "module_title": module_titles.get(attendance.module_id),
                    "student_email": attendance.student_email,
                    "module_id": attendance.module_id,
                    "attendance_records": [],
                    "created_at": attendance.created_at,
                    "created_by": attendance.created_by,
                    "last_modified_at": attendance.last_modified_at,
                    "last_modified_by": attendance.last_modified_by,
                }

            students_dict[student_id]["attendance_records"].append(attendance)

        for student_id, student_data in students_dict.items():
            percentage = student_percentage(student_data["attendance_records"])
            student_data["attendance_percentage"] = percentage
            del student_data["attendance_records"]

        students_list = list(students_dict.values())

        response = {
            "students": students_list,
            "total_students": len(students_list),
        }

        return jsonify(response), 200

    except Exception as e:
        log.error("Error processing request: %s", str(e))
        return (
            jsonify({"message": "An error occurred while processing the request."}),
            500,
        )


def student_percentage(attendance_records):
    """Calculate the attendance percentage for a list of attendance records."""
    total_classes = len(attendance_records)
    if total_classes == 0:
        return "0%"

    total_present = sum(
        1
        for record in attendance_records
        if record.attendance_status in ["Present", "Late"]
    )

    percentage = max(min(int((total_present / total_classes) * 100), 100), 0)
    return f"{percentage}%"

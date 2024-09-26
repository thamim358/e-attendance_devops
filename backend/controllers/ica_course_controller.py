import calendar
from datetime import datetime, timedelta
import logging
from flask import jsonify, make_response, request
import requests
from sqlalchemy import and_, distinct, func, or_
import pandas as pd
from typing import List

from models.psb.module_master_temp import ModuleMasterTemp
from models.sms.sms_fin_number_view import SMS_Fin_Number_View
from config.db import db
from models.psb.school_master_temp import InternationalStudents
from utils.common.module_details import fetch_modules_by_courses
from models.psb.attendance import Attendance
from models.sms.sms_cv001_view import SMS_CV001_View
from models.sms.sms_f7_view import SMS_F7_View
from models.psb.ica_course import CourseMasterTemp


log = logging.getLogger("psb_academy_logger")


def get_courses_by_school_code(school_code):
    if not school_code:
        return make_response(jsonify({"message": "Please enter a school code"}), 400)
    try:
        courses = CourseMasterTemp.query.filter_by(sbu=school_code).all()
        log.info(f"Fetching courses for school code: {school_code}")
        if not courses:
            return jsonify({"courses": []}), 404
        courses_list = [
            {
                "course_code": course.course_code,
                "course_id": course.id,
                "course_partner_name": course.course_partner_name,
                "course_title": course.course_title,
                "discipline": course.discipline,
                "level": course.level,
                "sbu": course.sbu,
                "schedule_type": course.schedule_type,
            }
            for course in courses
        ]
        return jsonify({"courses": courses_list}), 200
    except Exception:
        log.exception("Error fetching courses")
        return make_response(jsonify({"message": "Error fetching courses"}), 500)


def get_ica_attendance_filter():
    try:
        data = request.json
        school_code = data.get("school")
        course_code = data.get("course_code")
        module_code = data.get("module_id")
        cohort_name = data.get("cohort_name")
        student_name = data.get("student_name")
        country_name = data.get("country_name")
        month = data.get("month")
        year = data.get("year")
        student_type = data.get("student_type")

        start_date = datetime(year, month, 1)
        end_date = datetime(
            year + (1 if month == 12 else 0), month % 12 + 1, 1
        ) - timedelta(days=1)

        start_date_str = start_date.strftime("%Y-%m-%dT%H:%M:%S")
        end_date_str = end_date.strftime("%Y-%m-%dT%H:%M:%S")

        query = Attendance.query.filter(
            Attendance.join_time >= start_date_str,
            Attendance.leave_time <= end_date_str,
        )

        if school_code:
            if not course_code:
                course_codes_list = (
                    CourseMasterTemp.query.filter_by(sbu=school_code)
                    .with_entities(CourseMasterTemp.course_code)
                    .all()
                )
                course_codes_list = [code[0] for code in course_codes_list]
                query = query.filter(Attendance.course_code.in_(course_codes_list))
            else:
                query = query.filter(Attendance.course_code == course_code)

        if student_name:
            student_filter = f"%{student_name}%"
            query = query.filter(
                or_(
                    Attendance.student_name.ilike(student_filter),
                    Attendance.student_email.ilike(student_filter),
                    Attendance.enrollment_id.ilike(student_filter),
                    Attendance.student_id.ilike(student_filter),
                )
            )

        if student_type == "International":
            query = query.filter(Attendance.domicile == "International")

        all_attendances = query.with_entities(
            Attendance.student_id,
            Attendance.course_cohort_name,
            Attendance.enrollment_id,
            Attendance.student_name,
            Attendance.attendance_status,
            Attendance.course_code,
            Attendance.module_id,
            Attendance.student_email,
            Attendance.country_name,
            Attendance.domicile,
            Attendance.join_time,
            Attendance.student_dob,
            Attendance.attendance_type,
            Attendance.nric_fin,
        ).all()

        if not all_attendances:
            return jsonify({"course_details": []}), 200

        course_codes = {attendance.course_code for attendance in all_attendances}
        module_codes = {attendance.module_id for attendance in all_attendances}
        course_titles = {
            course.course_code: course.course_title
            for course in CourseMasterTemp.query.filter(
                CourseMasterTemp.course_code.in_(course_codes)
            ).all()
        }
        module_titles = {
            module.module_code: module.module_title
            for module in ModuleMasterTemp.query.filter(
                ModuleMasterTemp.module_code.in_(module_codes)
            ).all()
        }

        student_attendance_percentages = calculate_course_percentage(all_attendances)

        unique_attendances = {
            attendance.student_id: {
                "cohort_name": attendance.course_cohort_name,
                "enrollment_id": attendance.enrollment_id,
                "student_name": attendance.student_name,
                "status": attendance.attendance_status,
                "course_code": attendance.course_code,
                "course_name": course_titles.get(attendance.course_code, None),
                "module_name": module_titles.get(attendance.module_id, None),
                "student_id": attendance.student_id,
                "email": attendance.student_email,
                "country_name": attendance.country_name,
                "nationality": (
                    "International"
                    if attendance.domicile == "International"
                    else "Local"
                ),
                "join_time": attendance.join_time,
                "date_of_birth": attendance.student_dob or None,
                "attendance_type": attendance.attendance_type,
                "percentage": f"{round(student_attendance_percentages.get(attendance.student_id, 0))}%",
                "fin_number": attendance.nric_fin or None,
            }
            for attendance in all_attendances
        }

        course_details = list(unique_attendances.values())
        return jsonify({"course_details": course_details}), 200

    except Exception as e:
        log.error("Error in ica_filter_attendance: %s", str(e))
        return (
            jsonify({"error": "An error occurred while processing the request."}),
            500,
        )


def calculate_course_percentage(attendances):
    log.info("Calculating course percentage for students.")
    student_attendance = {}

    for attendance in attendances:
        student_id = attendance.student_id
        attendance_status = attendance.attendance_status

        if student_id not in student_attendance:
            student_attendance[student_id] = {
                "total_module_count": 0,
                "attended_module_count": 0,
            }

        # Increment total module count for the student
        student_attendance[student_id]["total_module_count"] += 1
        log.info(
            "Student ID: %s, Module ID: %s, Status: %s",
            student_id,
            attendance.module_id,
            attendance_status,
        )

        # Count attended modules
        if attendance_status in ["Present", "Late"]:
            student_attendance[student_id]["attended_module_count"] += 1
            log.info(
                "Student ID: %s, Attended module count: %d",
                student_id,
                student_attendance[student_id]["attended_module_count"],
            )

    # Calculate and log attendance percentages for each student
    student_percentages = {}
    for student_id, data in student_attendance.items():
        total_modules = data["total_module_count"]
        attended_modules = data["attended_module_count"]
        overall_percentage = (
            (attended_modules / total_modules) * 100 if total_modules > 0 else 0
        )
        student_percentages[student_id] = overall_percentage
        log.info(
            "Student ID: %s, Total modules: %d, Attended modules: %d, Overall percentage: %.2f%%",
            student_id,
            total_modules,
            attended_modules,
            overall_percentage,
        )

    return student_percentages


def generate_attendance_report(
    attendance_data: List[dict], module_codes: List[str]
) -> pd.DataFrame:
    df = pd.DataFrame(attendance_data)
    print("Columns in attendance data:", df.columns)

    if "enrollment_id" not in df.columns:
        raise ValueError("Column 'enrollment_id' is missing from attendance data")
    df = df[df["module_code"].isin(module_codes)]
    total_classes = df.groupby("enrollment_id").size()
    attended_classes = (
        df[df["status"].isin(["Present", "Late"])].groupby("enrollment_id").size()
    )
    attendance_percentage = (attended_classes / total_classes * 100).round(2)
    report = pd.DataFrame(
        {
            "student_name": df.groupby("enrollment_id")["full_name"].first(),
            "total_classes": total_classes,
            "attended_classes": attended_classes,
            "percentage": attendance_percentage,
        }
    ).reset_index()
    report = report.rename(columns={"enrollment_id": "enrollment_id"})
    print("Columns in initial report:", report.columns)
    report = report[
        [
            "enrollment_id",
            "student_name",
            "total_classes",
            "attended_classes",
            "percentage",
        ]
    ]
    report["attended_classes"] = report["attended_classes"].fillna(0).astype(int)
    report["percentage"] = (
        report["attended_classes"] / report["total_classes"] * 100
    ).round(2)
    additional_details = df[
        [
            "enrollment_id",
            "module_code",
            "course_code",
            "course_name",
            "module_name",
            "student_id",
            "email",
            "cohort_name",
            "date_of_birth",
            "country_name",
            "nationality",
        ]
    ].drop_duplicates()
    additional_details = additional_details.rename(
        columns={"enrollment_id": "enrollment_id"}
    )
    print("Columns in additional details:", additional_details.columns)
    report = report.merge(additional_details, on="enrollment_id", how="left")
    report = report.loc[:, ~report.columns.duplicated()]

    return report

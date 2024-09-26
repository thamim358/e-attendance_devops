import logging
from flask import jsonify, make_response, request
from models.psb.ica_course import CourseMasterTemp
from config.db import db
from models.psb.attendance import Attendance
from models.psb.module_master_temp import ModuleMasterTemp

log = logging.getLogger("psb_academy_logger")


def get_all_students():
    try:
        students = (
            Attendance.query.with_entities(
                Attendance.student_id,
                Attendance.student_name,
                Attendance.student_email,
                Attendance.enrollment_id,
            )
            .distinct()
            .all()
        )

        students_list = [
            {
                "student_id": student.student_id,
                "student_name": student.student_name,
                "student_email": student.student_email,
                "enrollment_id": student.enrollment_id,
            }
            for student in students
        ]

        return jsonify({"students": students_list})

    except Exception as e:
        return make_response(jsonify({"message": "Error fetching students"}), 500)


def get_by_student_view_details():
    try:
        data = request.get_json()
        student_id = data.get("student_id")
        module_code = data.get("module_code")

        students_list = []

        attendance_query = Attendance.query
        if student_id:
            attendance_query = attendance_query.filter_by(
                student_id=student_id
            )
        if module_code:
            attendance_query = attendance_query.filter_by(
                module_id=module_code
            )

        attendance_records = attendance_query.all()

        module_codes = {att.module_id for att in attendance_records}
        course_codes = {att.course_code for att in attendance_records}

        modules = ModuleMasterTemp.query.filter(
            ModuleMasterTemp.module_code.in_(module_codes)
        ).all()
        courses = CourseMasterTemp.query.filter(
            CourseMasterTemp.course_code.in_(course_codes)
        ).all()

        module_dict = {module.module_code: module for module in modules}
        course_dict = {course.course_code: course for course in courses}

        for attendance_record in attendance_records:
            module = module_dict.get(attendance_record.module_id)
            course = course_dict.get(attendance_record.course_code)

            student_data = {
                "student_id": attendance_record.student_id,
                "student_name": attendance_record.student_name,
                "student_email": attendance_record.student_email,
                "attendance_status": attendance_record.attendance_status,
                "module_id": module.module_code if module else None,
                "module_title": module.module_title if module else None,
                "attendance_type": attendance_record.attendance_type,
                "join_time": attendance_record.join_time,
                "leave_time": attendance_record.leave_time,
                "total_time": attendance_record.total_time,
                "context_identifier": attendance_record.context_identifier,
                "country_name": attendance_record.country_name,
                "attendance_id": attendance_record.attendance_id,
                "enrollment_id": attendance_record.enrollment_id,
                "enrollment_status": attendance_record.enrollment_status,
                "nric_fin": attendance_record.nric_fin,
                "course_code": course.course_code if course else None,
                "course_title": course.course_title if course else None,
                "scheduled_module_name": attendance_record.activity_name,
            }

            students_list.append(student_data)

        return jsonify({"students": students_list}), 200

    except Exception as e:
        log.error(f"Error in get_by_student_view_details: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


def get_by_module_view_details():
    try:
        data = request.get_json()
        module_code = data.get("module_code")
        course_cohort_name = data.get("course_cohort_name")
        student_id = data.get("student_id")

        students_list = []

        attendance_query = Attendance.query
        if module_code:
            attendance_query = attendance_query.filter_by(
                module_id=module_code
            )

        if course_cohort_name:
            attendance_query = attendance_query.filter_by(
                course_cohort_name=course_cohort_name
            )

        if student_id:
            attendance_query = attendance_query.filter_by(
                student_id=student_id
            )

        attendance_records = attendance_query.all()

        module_codes = {att.module_id for att in attendance_records}
        course_codes = {att.course_code for att in attendance_records}

        modules = ModuleMasterTemp.query.filter(
            ModuleMasterTemp.module_code.in_(module_codes)
        ).all()
        courses = CourseMasterTemp.query.filter(
            CourseMasterTemp.course_code.in_(course_codes)
        ).all()

        module_dict = {module.module_code: module for module in modules}
        course_dict = {course.course_code: course for course in courses}

        for attendance_record in attendance_records:
            module = module_dict.get(attendance_record.module_id)
            course = course_dict.get(attendance_record.course_code)

            student_data = {
                "student_id": attendance_record.student_id,
                "student_name": attendance_record.student_name,
                "student_email": attendance_record.student_email,
                "attendance_status": attendance_record.attendance_status,
                "module_id": module.module_code if module else None,
                "module_title": module.module_title if module else None,
                "attendance_type": attendance_record.attendance_type,
                "join_time": attendance_record.join_time,
                "leave_time": attendance_record.leave_time,
                "total_time": attendance_record.total_time,
                "context_identifier": attendance_record.context_identifier,
                "country_name": attendance_record.country_name,
                "attendance_id": attendance_record.attendance_id,
                "enrollment_id": attendance_record.enrollment_id,
                "enrollment_status": attendance_record.enrollment_status,
                "nric_fin": attendance_record.nric_fin,
                "course_id": course.course_code if course else None,
                "course_title": course.course_title if course else None,
                "scheduled_module_name": attendance_record.activity_name,
            }

            students_list.append(student_data)

        return jsonify(students_list), 200

    except Exception as e:
        log.error("Error while fetching module view details: %s", str(e))
        return jsonify({"error": "Internal Server Error"}), 500


def get_by_ica_student():
    data = request.get_json()
    student_id = data.get("student_id")
    course_code = data.get("course_code")

    get_students = Attendance.query.filter_by(
        student_id=student_id, course_code=course_code
    ).all()

    module_ids = [student.module_id for student in get_students]
    course_codes = [student.course_code for student in get_students]

    modules = ModuleMasterTemp.query.filter(
        ModuleMasterTemp.module_code.in_(module_ids)
    ).all()
    courses = CourseMasterTemp.query.filter(CourseMasterTemp.course_code.in_(course_codes)).all()

    module_dict = {module.module_code: module for module in modules}
    course_dict = {course.course_code: course for course in courses}

    student_list = []

    for get_student in get_students:
        module = module_dict.get(get_student.module_id)
        course = course_dict.get(get_student.course_code)

        student_data = {
            "student_id": get_student.student_id,
            "student_name": get_student.student_name,
            "student_email": get_student.student_email,
            "attendance_status": get_student.attendance_status,
            "module_id": module.module_code if module else None,
            "module_title": module.module_title if module else None,
            "attendance_type": get_student.attendance_type,
            "join_time": get_student.join_time,
            "leave_time": get_student.leave_time,
            "total_time": get_student.total_time,
            "context_identifier": get_student.context_identifier,
            "country_name": get_student.country_name,
            "attendance_id": get_student.attendance_id,
            "enrollment_id": get_student.enrollment_id,
            "enrollment_status": get_student.enrollment_status,
            "nric_fin": get_student.nric_fin,
            "course_id": course_code,
            "course_title": course.course_title if course else None,
            "scheduled_module_name": get_student.activity_name,
        }

        student_list.append(student_data)

    if not student_list:
        return jsonify([]), 404

    return student_list, 200

def get_school_by_students():
    try:
        data = request.get_json()
        school_code = data.get("school_code")
        course_code = data.get("course_code")
        module_code = data.get("module_code")
        course_cohort_name = data.get("course_cohort_name")

        attendance_query = Attendance.query

        if school_code:
            course_codes_list = (
                CourseMasterTemp.query
                .filter_by(sbu=school_code)
                .with_entities(CourseMasterTemp.course_code)
                .distinct()
                .all()
            )
            course_codes_list = [code[0] for code in course_codes_list]
            attendance_query = attendance_query.filter(Attendance.course_code.in_(course_codes_list))


        if course_code:
            attendance_query = attendance_query.filter_by(course_code=course_code)

        if module_code:
            attendance_query = attendance_query.filter_by(module_id=module_code)

        if course_cohort_name:
            attendance_query = attendance_query.filter_by(course_cohort_name=course_cohort_name)

        students = attendance_query.all()  

        students_list = []
        unique_student_ids = set()  

        for student in students:
            if student.student_id not in unique_student_ids:
                unique_student_ids.add(student.student_id)  
                student_info = {
                    "student_id": student.student_id,
                    "student_name": student.student_name,
                    "student_email": student.student_email,
                    "enrollment_id": student.enrollment_id,
                }
                students_list.append(student_info)  

        if not students_list:
            return jsonify({"students": []}), 404 

        return jsonify({"students": students_list}),200


    except Exception as e:
        return make_response(jsonify({"message": "Error fetching students"}), 500)
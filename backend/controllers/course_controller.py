import logging

from flask import jsonify, make_response, request

from models.psb.module_master_temp import ModuleMasterTemp
from models.psb.ica_course import CourseMasterTemp
from models.sms.sms_f7_view import SMS_F7_View
from models.psb.attendance import Attendance
from models.sms.sms_cv001_view import SMS_CV001_View


log = logging.getLogger("psb_academy_logger")


def get_all_courses():
    try:
        unique_course_codes = (
            Attendance.query.with_entities(Attendance.course_code)
            .filter(Attendance.course_code.isnot(None))
            .distinct()
            .all()
        )
        course_codes = [code[0] for code in unique_course_codes]
        courses = CourseMasterTemp.query.filter(
            CourseMasterTemp.course_code.in_(course_codes)
        ).all()
        course_list = [
            {
                "course_id": course.course_code,
                "course_title": course.course_title,
                # "course_cohort_name": course.course_cohort_batch_name,
            }
            for course in courses
        ]
        return jsonify({"courses": course_list})
    except Exception as e:
        log.exception("Exception occurred :: error=%s", e)
        return make_response(
            jsonify({"message": "Error fetching courses"}), 500
        )


def get_module_by_course_id():
    data = request.get_json()
    course_id = data.get("course_id")

    try:
        course_modules = (
            Attendance.query.filter_by(course_code=course_id)
            .with_entities(Attendance.module_id)
            .distinct()
            .all()
        )
        module_ids = [module_id[0] for module_id in course_modules]

        if not module_ids:
            return jsonify({"module_details": []}), 200

        course_info = SMS_F7_View.query.filter(
            SMS_F7_View.course_code == course_id,
            SMS_F7_View.module_code.in_(module_ids),
        ).all()

        if not course_info:
            return jsonify({"module_details": []}), 404

        unique_modules = {}
        for mod in course_info:
            if mod.module_code not in unique_modules:
                unique_modules[mod.module_code] = {
                    "module_id": mod.module_code,
                    "module_title": mod.module_name,
                    "course_id": mod.course_code,
                    "course_title": mod.course_name,
                }

        module_details = list(unique_modules.values())

        return jsonify({"module_details": module_details}), 200

    except Exception as e:
        log.exception(
            "Exception occurred while fetching course :: error=%s", e
        )
        return make_response(
            jsonify({"message": "Error fetching course records"}), 500
        )


def get_cohort_course():
    data = request.get_json()
    course_id = data.get("course_id")
    module_id = data.get("module_id")
    try:
        query = Attendance.query.distinct(
            Attendance.course_code,
            Attendance.module_id,
            Attendance.course_cohort_name,
        )

        if course_id and module_id:
            query = query.filter_by(course_code=course_id, module_id=module_id)
        elif course_id:
            query = query.filter(Attendance.course_code == course_id)
        elif module_id:
            query = query.filter(Attendance.module_id == module_id)

        cohort_courses = query.all() if course_id or module_id else []

        cohort_course_list = list(
            {
                (
                    cohort_course.course_code,
                    cohort_course.module_id,
                    cohort_course.course_cohort_name,
                )
                for cohort_course in cohort_courses
            }
        )

        cohort_course_list = [
            {
                "course_id": course_id,
                "module_id": module_id,
                "cohort_name": cohort_name,
            }
            for course_id, module_id, cohort_name in cohort_course_list
        ]

        if not cohort_course_list:
            return make_response(jsonify({"cohort_course_list": []})), 404

        return jsonify({"cohort_course_details": cohort_course_list}), 200

    except Exception as e:
        log.exception(
            "Exception occurred while fetching cohort course :: error= %s", e
        )
        return make_response(
            jsonify({"message": "Error fetching cohort course records"}), 500
        )


def get_school_by_modules():
    data = request.get_json()
    school_code = data.get("school_code")
    try:
        course_codes_list = (
            CourseMasterTemp.query.filter_by(sbu=school_code)
            .with_entities(CourseMasterTemp.course_code)
            .all()
        )

        course_codes_list = [code[0] for code in course_codes_list]

        attendance_and_modules = (
            Attendance.query.join(
                ModuleMasterTemp,
                Attendance.module_id == ModuleMasterTemp.module_code,
            )
            .with_entities(Attendance.module_id, ModuleMasterTemp.module_title)
            .filter(Attendance.course_code.in_(course_codes_list))
            .distinct()
            .all()
        )

        module_list = [
            {"module_id": module_id, "module_title": module_title}
            for module_id, module_title in attendance_and_modules
        ]

        if not module_list:
            return jsonify({"module_list": []}),404

        return jsonify({"module_list": module_list}),200

    except Exception as e:
        log.exception(
            "Exception occurred while fetching module :: error=%s", e
        )
        return make_response(
            jsonify({"message": "Error fetching module records"}), 500
        )

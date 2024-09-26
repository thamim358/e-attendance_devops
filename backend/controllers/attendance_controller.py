from ast import Module
from datetime import datetime, timedelta
import logging
from flask import jsonify, make_response, request

from models.psb.attendance import Attendance
from models.psb.course import Course

log = logging.getLogger("psb_academy_logger")


def get_all_attendances():
    try:
        attendances = Attendance.query.all()
        attendance_data = []

        if attendances:
            for attendance in attendances:
                module = Module.query.filter_by(
                    module_code=attendance.module_id
                ).first()
                course = (
                    Course.query.filter_by(course_id=module.course_id).first()
                    if module
                    else None
                )

                # cohort = None
                # course_cohort = None
                # if attendance.cohort_id:
                #     cohort = CohortModule.query.filter_by(cohort_id=attendance.cohort_id).first()
                #     log.info("cohort : %s",cohort)
                #     course_cohort = cohort.course_cohort if cohort else None
                #     log.info("course_cohort : %s",course_cohort)

                attendance_data.append(
                    {
                        "attendance_id": attendance.attendance_id,
                        "student_id": attendance.student_id,
                        "country_id": attendance.country_id,
                        "country_name": attendance.country_name,
                        "student_name": attendance.student_name,
                        "student_email": attendance.student_email,
                        "enrollment_id": attendance.enrollment_id,
                        "enrollment_status": attendance.enrollment_status,
                        "module_id": attendance.module_id if module else None,
                        "module_title": (
                            module.module_title if module else None
                        ),
                        "join_time": (
                            attendance.join_time.strftime("%H:%M:%S")
                            if attendance.join_time
                            else None
                        ),
                        "leave_time": (
                            attendance.leave_time.strftime("%H:%M:%S")
                            if attendance.leave_time
                            else None
                        ),
                        "total_time": (
                            str(attendance.total_time)
                            if attendance.total_time
                            else None
                        ),
                        "attendance_status": attendance.attendance_status,
                        "attendance_type": attendance.attendance_type,
                        "created_at": attendance.created_at,
                        "created_by": attendance.created_by,
                        "last_modified_at": attendance.last_modified_at,
                        "last_modified_by": attendance.last_modified_by,
                        "course_id": course.course_id if course else None,
                        "course_title": (
                            course.course_title if course else None
                        ),
                        "course_code": course.course_code if course else None,
                        "cohort_id": (
                            attendance.cohort_id
                            if attendance.cohort_id
                            else None
                        ),
                        "course_cohort": (
                            attendance.cohort.course_cohort
                            if attendance.cohort_id
                            else None
                        ),
                    }
                )

            return jsonify({"attendances": attendance_data})
        else:
            return make_response(
                jsonify({"message": "Attendance records not found"}), 404
            )
    except Exception as e:
        log.exception("Exception occurred :: error=%s", e)
        return make_response(
            jsonify({"message": "Error fetching attendance records"}), 500
        )

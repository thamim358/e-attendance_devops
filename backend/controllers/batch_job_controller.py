import logging
from flask import jsonify, make_response, request
from sqlalchemy.orm import aliased
from models.psb.batch_job import BatchJob
from config.db import db
from models.psb.excel_BB_attendance import ExcelBBAttendance
from models.psb.excel_SSO_interface import ExcelSSOInterface
from models.psb.excel_mod_enrollment import ExcelModEnrollment
from models.psb.excel_student_enrollment import ExcelStudentEnrollment
from models.psb.excel_weekly_splus import ExcelWeeklyPlus
from utils.common.attendance_tracker import student_attendance_status

# Configure your logger
log = logging.getLogger("psb_academy_logger")


def get_all_batch_jobs():
    # Alias the tables for more readable queries
    bb_attendance_alias = aliased(ExcelBBAttendance)
    sso_interface_alias = aliased(ExcelSSOInterface)
    mod_enrollment_alias = aliased(ExcelModEnrollment)
    student_enrollment_alias = aliased(ExcelStudentEnrollment)
    weekly_s_plus_alias = aliased(ExcelWeeklyPlus)

    # Perform the join and query the data
    query = (
        db.session.query(
            bb_attendance_alias,
            sso_interface_alias,
            mod_enrollment_alias,
            student_enrollment_alias,
            weekly_s_plus_alias,
        )
        .outerjoin(
            sso_interface_alias,
            sso_interface_alias.login_iD == bb_attendance_alias.username,
        )
        .outerjoin(
            mod_enrollment_alias,
            mod_enrollment_alias.id_Number == bb_attendance_alias.username,
        )
        .outerjoin(
            student_enrollment_alias,
            student_enrollment_alias.psb_id == bb_attendance_alias.username,
        )
        .outerjoin(
            weekly_s_plus_alias,
            (weekly_s_plus_alias.module_id == mod_enrollment_alias.module_Code)
            & (
                weekly_s_plus_alias.module_host_key
                == bb_attendance_alias.context_identifier
            ),
        )
    )

    # Fetch all the results
    results = query.all()

    final_result = []
    for (
        bb_Attendance_Result,
        sso_Interface_Result,
        mod_enrollment_Result,
        student_enrollment_Result,
        weekly_s_plus_Result,
    ) in results:

        course_StartTime = (
            weekly_s_plus_Result.start_time.strftime("%H:%M:%S")
            if weekly_s_plus_Result and weekly_s_plus_Result.start_time
            else ""
        )
        course_endTime = (
            weekly_s_plus_Result.end_time.strftime("%H:%M:%S")
            if weekly_s_plus_Result and weekly_s_plus_Result.end_time
            else ""
        )
        student_JoinTime = (
            bb_Attendance_Result.attendee_firstjointime.isoformat()
            if bb_Attendance_Result
            and bb_Attendance_Result.attendee_firstjointime
            else None
        )
        student_LeaveTime = (
            bb_Attendance_Result.attendee_lastleavetime.isoformat()
            if bb_Attendance_Result
            and bb_Attendance_Result.attendee_lastleavetime
            else None
        )

        # Attendance status controller props
        # student_attendance_status(
        #     course_StartTime, course_endTime, student_JoinTime, student_LeaveTime
        # )
        saving_attend_status = student_attendance_status(
            course_StartTime,
            course_endTime,
            student_JoinTime,
            student_LeaveTime,
        )

        final_result.append(
            {
                "attendance_id": (
                    bb_Attendance_Result.bb_id
                    if bb_Attendance_Result
                    else None
                ),
                "attendance_status": saving_attend_status,
                "student_id": (
                    bb_Attendance_Result.username
                    if bb_Attendance_Result and bb_Attendance_Result.username
                    else None
                ),
                "student_name": (
                    mod_enrollment_Result.student_Name
                    if mod_enrollment_Result
                    and mod_enrollment_Result.student_Name
                    else None
                ),
                "student_join_time": student_JoinTime,
                "student_leave_time": student_LeaveTime,
                "student_total_attended_time": (
                    bb_Attendance_Result.attendee_totaltime_insession
                    if bb_Attendance_Result
                    and bb_Attendance_Result.attendee_totaltime_insession
                    else None
                ),
                "module_id": (
                    mod_enrollment_Result.module_Code
                    if mod_enrollment_Result
                    and mod_enrollment_Result.module_Code
                    else None
                ),
                "enrollment_id": (
                    mod_enrollment_Result.enr_Number
                    if mod_enrollment_Result
                    and mod_enrollment_Result.enr_Number
                    else None
                ),
                "enrollment_status": (
                    student_enrollment_Result.enrollment_status
                    if student_enrollment_Result
                    and student_enrollment_Result.enrollment_status
                    else None
                ),
                "context_identifier": (
                    bb_Attendance_Result.context_identifier
                    if bb_Attendance_Result
                    else None
                ),
                "student_email": (
                    mod_enrollment_Result.email
                    if mod_enrollment_Result and mod_enrollment_Result.email
                    else None
                ),
                "created_at": (
                    sso_Interface_Result.creation_date.isoformat()
                    if sso_Interface_Result
                    and sso_Interface_Result.creation_date
                    else None
                ),
                "created_by": (
                    sso_Interface_Result.created_by
                    if sso_Interface_Result
                    else None
                ),
                "last_modified_at": (
                    sso_Interface_Result.last_created_or_updated_date.isoformat()
                    if sso_Interface_Result
                    and sso_Interface_Result.last_created_or_updated_date
                    else None
                ),
                "last_modified_by": (
                    sso_Interface_Result.updated_by
                    if sso_Interface_Result and sso_Interface_Result.updated_by
                    else None
                ),
                "course_start_time": course_StartTime,
                "course_end_time": course_endTime,
                "course_duration": (
                    str(weekly_s_plus_Result.duration)
                    if weekly_s_plus_Result and weekly_s_plus_Result.duration
                    else ""
                ),
                "scheduled_module_name": (
                    weekly_s_plus_Result.original_activity_name
                    if weekly_s_plus_Result
                    and weekly_s_plus_Result.original_activity_name
                    else ""
                ),
            }
        )

    return jsonify(final_result)


def serialize_batchjob(batchjob):
    return {
        "batchjob_id": batchjob.batchjob_id,
        "batchjob_name": batchjob.batchjob_name,
        "batchjob_start_time": (
            batchjob.batchjob_start_time.isoformat()
            if batchjob.batchjob_start_time
            else None
        ),
        "batchjob_end_time": (
            batchjob.batchjob_end_time.isoformat()
            if batchjob.batchjob_end_time
            else None
        ),
        "batchjob_date": (
            batchjob.batchjob_date.isoformat() if batchjob.batchjob_date else None
        ),
        "failed_reports": batchjob.failed_reports,
        "batch_job_status": batchjob.batch_job_status,
        "created_at": (
            batchjob.created_at.isoformat() if batchjob.created_at else None
        ),
        "created_by": batchjob.created_by,
        "last_modified_at": (
            batchjob.last_modified_at.isoformat()
            if batchjob.last_modified_at
            else None
        ),
        "last_modified_by": batchjob.last_modified_by,
    }

def get_batchjob_by_date():
    try:
        data = request.json
        batchjob_id = data.get("batchjob_id")
        query = BatchJob.query
        if batchjob_id:
            query = query.filter(BatchJob.batchjob_id == batchjob_id)
        results = query.all()  

        serialized_results = [serialize_batchjob(job) for job in results]
        return make_response(jsonify(serialized_results), 200)

    except Exception as e:
        logging.error(f"Error fetching batchjob: {str(e)}")
        return make_response(jsonify({"error": "An error occurred"}), 500)



def get_all_batch_list():
    try:
        batchs = BatchJob.query.all()
        batch_list = [batch.json() for batch in batchs]
        return jsonify({"batch": batch_list})
    except Exception as e:
        logging.exception("Exception occurred :: error=%s", e)
        return make_response(
            jsonify({"message": "Error fetching batch_list"}),500)
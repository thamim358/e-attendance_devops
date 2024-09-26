import logging
from flask import jsonify, make_response, request
from models.sms.sms_cv001_view import SMS_CV001_View
from models.psb.attendance import Attendance

def get_all_ica_students():
    try:
        data = request.json
        school_code = data.get("school_code")
        course_code = data.get("course_code")

        get_all_Ica_students_response = []

        if school_code and course_code:
            # Fetch only the necessary fields for SMS_CV001_View
            get_ICA_students_query = SMS_CV001_View.query.with_entities(
                SMS_CV001_View.user_name
            ).filter_by(
                bu=school_code, course_code=course_code, domicile="International"
            )

            # Fetch only the necessary fields for Attendance
            attendance_query = Attendance.query.with_entities(
                Attendance.student_id, Attendance.student_name, 
                Attendance.student_email, Attendance.enrollment_id
            )

            attendance_dict = {
                att.student_id.lower(): att
                for att in attendance_query
                if att.student_id
            }

            for student in get_ICA_students_query:
                student_user_name_lower = student.user_name.lower()

                if student_user_name_lower in attendance_dict:
                    attendance_record = attendance_dict[student_user_name_lower]
                    get_all_Ica_students_response.append(
                        {
                            "full_name": attendance_record.student_name,
                            "student_code": attendance_record.student_id,
                            "email": attendance_record.student_email,
                            "enrollment_id": attendance_record.enrollment_id,
                        }
                    )
        else:
            get_all_Ica_students_response = []

        return make_response(jsonify(get_all_Ica_students_response), 200)

    except Exception as e:
        logging.error(f"Error fetching ICA students: {str(e)}")
        return make_response(jsonify({"error": "An error occurred"}), 500)

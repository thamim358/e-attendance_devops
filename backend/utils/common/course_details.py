from models.sms.sms_cv001_view import SMS_CV001_View
from sqlalchemy import func


def fetch_courses_by_students(student_data):
    try:
        result = []
        usernames = [
            student["username"].strip().upper()
            for student in student_data
            if student.get("username")
        ]

        username_courses = {}
        query = (
            SMS_CV001_View.query.with_entities(
                func.upper(SMS_CV001_View.user_name).label("user_name"),
                SMS_CV001_View.course_code,
            )
            .filter(
                func.upper(SMS_CV001_View.user_name).in_(
                    [username.upper() for username in usernames]
                )
            )
            .distinct()
            .yield_per(100)
        )

        for user_name, course_code in query:
            user_name = user_name.strip().upper()
            if user_name not in username_courses:
                username_courses[user_name] = set()
            username_courses[user_name].add(course_code)

        for student in student_data:
            username = student.get("username")
            if username:
                username = username.strip().upper()

                if username in username_courses:
                    course_codes_list = list(username_courses[username])
                    student_info = {
                        "student_name": student["student_name"],
                        "username": student["username"],
                        "course_codes": course_codes_list,
                    }
                else:
                    student_info = {
                        "student_name": student["student_name"],
                        "username": student["username"],
                        "course_codes": [],
                    }
                result.append(student_info)

        return result
    except Exception as e:
        print(
            f"An error occurred while fetching courses by students: {str(e)}"
        )
        return None

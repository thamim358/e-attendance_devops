from models.sms.sms_f7_view import SMS_F7_View


def fetch_modules_by_courses(courses_data):
    try:
        result = []

        course_codes = [
            course_code
            for student in courses_data
            for course_code in student.get("course_codes", [])
        ]

        if not course_codes:
            print("No valid course codes found.")
            return result

        query = (
            SMS_F7_View.query.with_entities(
                SMS_F7_View.course_code, SMS_F7_View.module_code
            )
            .filter(SMS_F7_View.course_code.in_(course_codes))
            .distinct()
            .yield_per(100)
        )

        course_modules = {}
        for course_code, module_code in query:
            if course_code not in course_modules:
                course_modules[course_code] = set()
            course_modules[course_code].add(module_code)

        for student in courses_data:
            student_info = {
                "student_name": student["student_name"],
                "username": student["username"],
                "courses": [],
            }

            for course_code in student.get("course_codes", []):
                modules_list = list(course_modules.get(course_code, []))
                student_info["courses"].append(
                    {"course_code": course_code, "modules": modules_list}
                )

            result.append(student_info)

        return result
    except Exception as e:
        print(f"An error occurred while fetching modules by courses: {str(e)}")
        return None

def fetch_student_details(data):
    try:
        student_details = []
        if data:
            for data in data:
                username = None
                if data["Username"]:
                    full_username = data["Username"]
                    username = (
                        full_username.split("@")[0]
                        if "@" in full_username
                        else full_username
                    )

                student_data = {
                    "student_name": data["NameOfAttendee"],
                    "username": username,
                }
                student_details.append(student_data)

        return student_details

    except Exception as e:
        print(f"An error occurred while fetching student details: {str(e)}")
        return None

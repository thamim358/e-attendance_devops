from datetime import datetime
from config.db import db


class SMS_CV001_View(db.Model):
    __bind_key__ = "mysql_db"
    __table_args__ = {"schema": "psb"}
    __tablename__ = "cv001"

    enquiry_id = db.Column(db.Integer, primary_key=True, name="enquiry_id")
    enrollment_id = db.Column(db.Integer, name="enrollment_id")
    full_name = db.Column(db.String(255), name="full_name")
    mobile_number = db.Column(db.String(255), name="mobile_number")
    date_of_birth = db.Column(db.String(72), name="date_of_birth")
    email = db.Column(db.String(255), name="email")
    gender = db.Column(db.String(255), name="gender")
    father_name = db.Column(db.String(255), name="father_name")
    father_mobile = db.Column(db.String(255), name="father_mobile")
    mother_name = db.Column(db.String(255), name="mother_name")
    remarks = db.Column(db.String(255), name="remarks")
    bu = db.Column(db.String(255), name="bu")
    course_name = db.Column(db.String(255), name="course_name")
    course_transcript_name = db.Column(
        db.String(255), name="course_transcript_name"
    )
    course_webform_name = db.Column(db.String(255), name="course_webform_name")
    course_code = db.Column(db.String(255), name="course_code")
    course_cohort_batch_name = db.Column(
        db.String(255), name="course_cohort_batch_name"
    )
    student_code = db.Column(db.String(255), name="student_code")
    user_name = db.Column(db.String(255), name="user_name")
    intake = db.Column(db.String(255), name="intake")
    admission_date = db.Column(db.DateTime, name="admission_date")
    type_of_pass = db.Column(db.String(255), name="type_of_pass")
    nationality = db.Column(db.String(255), name="nationality")
    enrollment_status = db.Column(db.String(255), name="enrollment_status")
    graduation_date = db.Column(db.DateTime, name="graduation_date")
    highest_qualification = db.Column(
        db.String(255), name="highest_qualification"
    )
    highest_qualification_type = db.Column(
        db.String(255), name="highest_qualification_type"
    )
    highest_qualification_institution = db.Column(
        db.String(255), name="highest_qualification_institution"
    )
    course_schedule_type = db.Column(
        db.String(255), name="course_schedule_type"
    )
    counsellor = db.Column(db.String, name="counsellor")
    domicile = db.Column(db.String(13), name="domicile")

    __mapper_args__ = {"primary_key": [enquiry_id]}

    def json(self):
        return {
            "enquiry_id": self.enquiry_id,
            "enrollment_id": self.enrollment_id,
            "full_name": self.full_name,
            "mobile_number": self.mobile_number,
            "date_of_birth": self.date_of_birth,
            "email": self.email,
            "gender": self.gender,
            "father_name": self.father_name,
            "father_mobile": self.father_mobile,
            "mother_name": self.mother_name,
            "remarks": self.remarks,
            "bu": self.bu,
            "course_name": self.course_name,
            "course_transcript_name": self.course_transcript_name,
            "course_webform_name": self.course_webform_name,
            "course_code": self.course_code,
            "course_cohort_batch_name": self.course_cohort_batch_name,
            "student_code": self.student_code,
            "user_name": self.user_name,
            "intake": self.intake,
            "admission_date": (
                str(self.admission_date) if self.admission_date else None
            ),
            "type_of_pass": self.type_of_pass,
            "nationality": self.nationality,
            "enrollment_status": self.enrollment_status,
            "graduation_date": (
                str(self.graduation_date) if self.graduation_date else None
            ),
            "highest_qualification": self.highest_qualification,
            "highest_qualification_type": self.highest_qualification_type,
            "highest_qualification_institution": self.highest_qualification_institution,
            "course_schedule_type": self.course_schedule_type,
            "counsellor": self.counsellor,
            "domicile": self.domicile,
        }

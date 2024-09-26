from config.db import db
from datetime import datetime, date


class ExcelStudentEnrollment(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "excel_student_enrollment"

    student_enrollment_id = db.Column(db.Integer, primary_key=True)
    psb_id = db.Column(db.String(255))
    nric_fin = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    first_name = db.Column(db.String(255))
    full_name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    citizenship = db.Column(db.String(255))
    nationality = db.Column(db.String(255))
    date_of_birth = db.Column(db.Date)
    enrollment_type = db.Column(db.String(255))
    course_enrolled_full_name = db.Column(db.String(255))
    course_code = db.Column(db.String(255))
    course_cohort = db.Column(db.String(255))
    course_schedule_type = db.Column(db.String(255))
    enrollment_status = db.Column(db.String(255))
    app_number = db.Column(db.String(255))

    def json(self):
        return {
            "student_enrollment_id": self.student_enrollment_id,
            "psb_id": self.psb_id,
            "nric_fin": self.nric_fin,
            "last_name": self.last_name,
            "first_name": self.first_name,
            "full_name": self.full_name,
            "email": self.email,
            "citizenship": self.citizenship,
            "nationality": self.nationality,
            "date_of_birth": self.date_of_birth,
            "enrollment_type": self.enrollment_type,
            "course_enrolled_full_name": self.course_enrolled_full_name,
            "course_code": self.course_code,
            "course_cohort": self.course_cohort,
            "course_schedule_type": self.course_schedule_type,
            "enrollment_status": self.enrollment_status,
            "app_number": self.app_number,
        }

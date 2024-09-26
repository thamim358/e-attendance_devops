from datetime import datetime
from config.db import db


class Student_details(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "student_details"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(255), nullable=False)
    student_email = db.Column(db.String(255), nullable=False)
    student_enrollment_id = db.Column(db.String(255), nullable=False)
    student_name = db.Column(db.String(255), nullable=False)
    date_of_birth = db.Column(db.String(255), nullable=False)

    def json(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_email": self.student_email,
            "student_enrollment_id": self.student_enrollment_id,
            "student_name": self.student_name,
            "date_of_birth": self.date_of_birth,
        }

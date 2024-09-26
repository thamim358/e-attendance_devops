from datetime import datetime
from config.db import db


class SmartGantryStudents(db.Model):
    __bind_key__ = "smart_gantry"
    __tablename__ = "students"
    __table_args__ = {"schema": "dbo"}

    id = db.Column("id", db.Integer, primary_key=True, nullable=False)
    employee_id = db.Column("employee_id", db.Integer)
    nric = db.Column("nric", db.Text)
    dob = db.Column("dob", db.Date)
    home_address = db.Column("home_address", db.Text)
    sex = db.Column("sex", db.String(191))
    mobile = db.Column("mobile", db.String(100))
    email = db.Column("email", db.String(191))
    parent_email = db.Column("parent_email", db.String(191))
    nationality = db.Column("nationality", db.String(191))
    citizenship = db.Column("citizenship", db.String(191))
    enrolled_date = db.Column("enrolled_date", db.Date)
    sites = db.Column("sites", db.String(191))
    school_id = db.Column("school_id", db.Integer)
    status = db.Column("status", db.String(20))
    created_at = db.Column("created_at", db.DateTime)
    updated_at = db.Column("updated_at", db.DateTime)
    student_id = db.Column("student_id", db.String(50))

    def json(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "nric": self.nric,
            "dob": self.dob.isoformat() if self.dob else None,
            "home_address": self.home_address,
            "sex": self.sex,
            "mobile": self.mobile,
            "email": self.email,
            "parent_email": self.parent_email,
            "nationality": self.nationality,
            "citizenship": self.citizenship,
            "enrolled_date": (
                self.enrolled_date.isoformat() if self.enrolled_date else None
            ),
            "sites": self.sites,
            "school_id": self.school_id,
            "status": self.status,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),
            "student_id": self.student_id,
        }

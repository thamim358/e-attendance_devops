from config.db import db
from datetime import datetime, date


class ExcelSSOInterface(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "excel_sso_interface"

    sso_id = db.Column(db.Integer, primary_key=True)
    sso_type = db.Column(db.String(255))
    id_number = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    first_name = db.Column(db.String(255))
    full_name = db.Column(db.String(255))
    default_email_Address = db.Column(db.String(255))
    login_iD = db.Column(db.String(255))
    account_status = db.Column(db.String(255))
    created_by = db.Column(db.String(255))
    creation_date = db.Column(db.DateTime)
    latest_course_title = db.Column(db.String(255))
    latest_course_category = db.Column(db.String(255))
    latest_course_schedule_code = db.Column(db.String(255))
    enrollment_status = db.Column(db.String(255))
    latest_course_department = db.Column(db.String(255))
    latest_schedule_start_date = db.Column(db.Date)
    latest_schedule_end_date = db.Column(db.Date)
    updated_by = db.Column(db.String(255))
    last_created_or_updated_date = db.Column(db.DateTime)

    def json(self):
        return {
            "sso_id": self.sso_id,
            "sso_type": self.sso_type,
            "id_number": self.id_number,
            "last_name": self.last_name,
            "first_name": self.first_name,
            "full_name": self.full_name,
            "default_email_Address": self.default_email_Address,
            "login_iD": self.login_iD,
            "account_status": self.account_status,
            "created_by": self.created_by,
            "creation_date": self.creation_date,
            "latest_course_title": self.latest_course_title,
            "latest_course_category": self.latest_course_category,
            "latest_course_schedule_code": self.latest_course_schedule_code,
            "enrollment_status": self.enrollment_status,
            "latest_course_department": self.latest_course_department,
            "latest_schedule_start_date": self.latest_schedule_start_date,
            "latest_schedule_end_date": self.latest_schedule_end_date,
            "updated_by": self.updated_by,
            "last_created_or_updated_date": self.last_created_or_updated_date,
        }

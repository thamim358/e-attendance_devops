from config.db import db
from datetime import datetime, date


class ExcelCourse(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "excel_course"

    course_id = db.Column(db.Integer, primary_key=True)
    program_code = db.Column(db.String(255))
    course_code = db.Column(db.String(255))
    course_title = db.Column(db.String(255))
    course_partner_name = db.Column(db.String(255))
    schedule_type = db.Column(db.String(255))
    sbu = db.Column(db.String(255))
    level = db.Column(db.String(255))
    discipline = db.Column(db.String(255))

    def json(self):
        return {
            "course_id": self.course_id,
            "program_code": self.program_code,
            "course_code": self.course_code,
            "course_title": self.course_title,
            "course_partner_name": self.course_partner_name,
            "schedule_type": self.schedule_type,
            "sbu": self.sbu,
            "level": self.level,
            "discipline": self.discipline,
        }

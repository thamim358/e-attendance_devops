from datetime import datetime
from config.db import db


class Course(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "course_master"

    course_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_code = db.Column(db.String(255))
    course_title = db.Column(db.String(255), nullable=False)
    course_type = db.Column(db.String(255), nullable=False)
    course_partner_name = db.Column(db.String(255))
    discipline = db.Column(db.String(255))
    schedule_start_date = db.Column(db.Date)
    schedule_end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.now)
    created_by = db.Column(db.String(255))
    last_modified_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    last_modified_by = db.Column(db.String(255))

    def json(self):
        return {
            "course_id": self.course_id,
            "course_code": self.course_code,
            "course_title": self.course_title,
            "course_type": self.course_type,
            "course_partner_name": self.course_partner_name,
            "discipline": self.discipline,
            "schedule_start_date": (
                self.schedule_start_date.isoformat()
                if self.schedule_start_date
                else None
            ),
            "schedule_end_date": (
                self.schedule_end_date.isoformat()
                if self.schedule_end_date
                else None
            ),
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "created_by": self.created_by,
            "last_modified_at": (
                self.last_modified_at.isoformat()
                if self.last_modified_at
                else None
            ),
            "last_modified_by": self.last_modified_by,
        }

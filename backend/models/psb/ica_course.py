from datetime import datetime
from config.db import db


class CourseMasterTemp(db.Model):
    __table_args__ = {"schema": "dbo"}
    __tablename__ = "course_master_temp"

    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(255))
    course_title = db.Column(db.String(255))
    course_partner_name = db.Column(db.String(255))
    schedule_type = db.Column(db.String(255))
    sbu = db.Column(db.String(255))  # Strategic Business Unit
    level = db.Column(db.String(255))
    discipline = db.Column(db.String(255))
    # created_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    # created_by = db.Column(db.String(255))
    # last_modified_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    # last_modified_by = db.Column(db.String(255))

    def json(self):
        return {
            "course_id": self.id,
            "course_code": self.course_code,
            "course_title": self.course_title,
            "course_partner_name": self.course_partner_name,
            "schedule_type": self.schedule_type,
            "sbu": self.sbu,
            "level": self.level,
            "discipline": self.discipline,
            # "created_at": self.created_at.isoformat() if self.created_at else None,
            # "created_by": self.created_by,
            # "last_modified_at": self.last_modified_at.isoformat() if self.last_modified_at else None,
            # "last_modified_by": self.last_modified_by,
        }

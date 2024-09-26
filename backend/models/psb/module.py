from datetime import datetime
from config.db import db


class Module(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "module_master"

    module_id = db.Column(db.Integer, primary_key=True)
    module_title = db.Column(db.String(255))
    course_id = db.Column(db.Integer)
    course_id = db.Column(
        db.Integer, db.ForeignKey("psb.course_master.course_id")
    )
    course = db.relationship(
        "Course", backref=db.backref("module_master", lazy=True)
    )
    module_code = db.Column(db.String(255))
    module_start_date = db.Column(db.DateTime, default=datetime.now)
    module_end_date = db.Column(db.DateTime, default=datetime.now)
    created_at = db.Column(db.DateTime, default=datetime.now)
    created_by = db.Column(db.String(255))
    last_modified_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    last_modified_by = db.Column(db.String(255))

    def json(self):
        return {
            "module_id": self.module_id,
            "module_title": self.module_title,
            "module_code": self.module_code,
            "course_id": self.course_id,
            "module_start_date": self.module_start_date,
            "module_end_date": self.module_end_date,
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

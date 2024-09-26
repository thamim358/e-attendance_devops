from datetime import datetime
from config.db import db


class Schedule(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "schedule"

    module_schedule_id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer)
    schedule_date = db.Column(db.Date)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)
    schedule_day = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)
    created_by = db.Column(db.String(255))
    last_modified_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    last_modified_by = db.Column(db.String(255))

    def json(self):
        return {
            "module_schedule_id": self.module_schedule_id,
            "module_id": self.module_id,
            "schedule_date": self.schedule_date,
            "start_time": (
                self.start_time.isoformat() if self.start_time else None
            ),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration": self.duration,
            "schedule_day": self.schedule_day,
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

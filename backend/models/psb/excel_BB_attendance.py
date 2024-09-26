from datetime import datetime
from config.db import db


class ExcelBBAttendance(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "excel_bb_attendance"

    bb_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    attendee_firstjointime = db.Column(db.DateTime)
    attendee_lastleavetime = db.Column(db.DateTime)
    attendee_totaltime_insession = db.Column(db.DateTime)
    context_identifier = db.Column(db.String(100))
    module_host_key = db.Column(db.String(100))

    def json(self):
        return {
            "bb_id": self.bb_id,
            "username": self.username,
            "attendee_firstjointime": self.attendee_firstjointime,
            "attendee_lastleavetime": self.attendee_lastleavetime,
            "attendee_totaltime_insession": self.attendee_totaltime_insession,
            "context_identifier": self.context_identifier,
            "module_host_key": self.module_host_key,
        }

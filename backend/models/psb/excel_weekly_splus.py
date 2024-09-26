from config.db import db
from datetime import datetime, date


class ExcelWeeklyPlus(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "excel_weekly_splus"

    activity_id = db.Column(db.Integer, primary_key=True)
    schedule_day = db.Column(db.VARCHAR(255))
    activity_type = db.Column(db.VARCHAR(255))
    name = db.Column(db.VARCHAR(255))
    allocated_staff = db.Column(db.VARCHAR(255))
    allocated_staff_email = db.Column(db.VARCHAR(255))
    activity_date = db.Column(db.Date)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.DateTime)
    allocated_location = db.Column(db.VARCHAR(255))
    module_description = db.Column(db.Text(100))
    zone_name = db.Column(db.VARCHAR(255))
    module_host_key = db.Column(db.VARCHAR(255))
    department_host_key = db.Column(db.VARCHAR(255))
    module_id = db.Column(db.VARCHAR(255))
    original_activity_name = db.Column(db.VARCHAR(255))

    def json(self):
        return {
            "activity_id": self.activity_id,
            "schedule_day": self.schedule_day,
            "activity_type": self.activity_type,
            "name": self.name,
            "allocated_staff": self.allocated_staff,
            "allocated_staff_email": self.allocated_staff_email,
            "activity_date": self.activity_date,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": self.duration,
            "allocated_location": self.allocated_location,
            "module_description": self.module_description,
            "zone_name": self.zone_name,
            "module_host_key": self.module_host_key,
            "department_host_key": self.department_host_key,
            "module_id": self.module_id,
            "original_activity_name": self.original_activity_name,
        }

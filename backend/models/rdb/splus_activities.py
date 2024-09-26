from datetime import datetime
from config.db import db


class SPlusActivities(db.Model):
    __bind_key__ = "rdb_db"
    __tablename__ = "v_SPlus_Activities"
    __table_args__ = {"schema": "dbo"}

    # Define columns based on the view structure
    Scheduled_Days = db.Column("Scheduled Days", db.String(30))
    Activity_Type_Name = db.Column("Activity Type Name", db.String(255))
    NAME = db.Column("NAME", db.String)
    Allocated_Staff_Name = db.Column("Allocated Staff Name", db.String(4000))
    Allocated_Staff_Email = db.Column("Allocated Staff Email", db.String(255))
    Activity_Dates = db.Column("Activity Dates (Individual)", db.Date)
    Scheduled_Start_Time = db.Column("Scheduled Start Time", db.String(5))
    Scheduled_End_Time = db.Column("Scheduled End Time", db.String(5))
    Duration = db.Column("Duration", db.String(5))
    Allocated_Location_Name = db.Column(
        "Allocated Location Name", db.String(4000)
    )
    Zone_Name = db.Column("Zone Name", db.String(4000))
    Module_Host_Key = db.Column("Module Host Key", db.String(4000))
    Department_Host_Key = db.Column("Department Host Key", db.String(255))
    Module_ID = db.Column("Module ID", db.String(32), primary_key=True)
    Original_Activity_Name = db.Column(
        "Original Actitivy Name", db.String(255)
    )
    Activity_ID = db.Column("Activity ID", db.String(32))
    ModuleName = db.Column("ModuleName", db.String(255))

    def json(self):
        return {
            "Scheduled_Days": self.Scheduled_Days,
            "Activity_Type_Name": self.Activity_Type_Name,
            "NAME": self.NAME,
            "Allocated_Staff_Name": self.Allocated_Staff_Name,
            "Allocated_Staff_Email": self.Allocated_Staff_Email,
            "Activity_Dates": (
                self.Activity_Dates.isoformat()
                if self.Activity_Dates
                else None
            ),
            "Scheduled_Start_Time": self.Scheduled_Start_Time,
            "Scheduled_End_Time": self.Scheduled_End_Time,
            "Duration": self.Duration,
            "Allocated_Location_Name": self.Allocated_Location_Name,
            "Zone_Name": self.Zone_Name,
            "Module_Host_Key": self.Module_Host_Key,
            "Department_Host_Key": self.Department_Host_Key,
            "Module_ID": self.Module_ID,
            "Activity_ID": self.Activity_ID,
            "ModuleName": self.ModuleName,
            "Original_Activity_Name": self.Original_Activity_Name,
        }

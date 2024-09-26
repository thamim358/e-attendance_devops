from config.db import db
from datetime import datetime, date


class ExcelModEnrollment(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "excel_mod_enrollment"

    mod_id = db.Column(db.Integer, primary_key=True)
    enr_Number = db.Column(db.String(255))
    enr_Date = db.Column(db.Date)
    student_Name = db.Column(db.String(255))
    id_Number = db.Column(db.String(255))
    email = db.Column(db.String(255))
    enr_Status = db.Column(db.String(255))
    course_Type = db.Column(db.String(255))
    module_Code = db.Column(db.String(255))
    module_Title = db.Column(db.String(255))
    preferred_Sch_Number = db.Column(db.String(255))
    assigned_Sch_Number = db.Column(db.String(255))
    schedule_Start_Date = db.Column(db.Date)
    schedule_End_Date = db.Column(db.Date)
    last_Updated_Date = db.Column(db.DateTime)
    course_code = db.Column(db.String(255))
    intake = db.Column(db.String(255))

    def json(self):
        return {
            "mod_id": self.mod_id,
            "enr_Number": self.enr_Number,
            "enr_Date": self.enr_Date,
            "student_Name": self.student_Name,
            "id_Number": self.id_Number,
            "email": self.email,
            "enr_Status": self.enr_Status,
            "course_Type": self.course_Type,
            "module_Code": self.module_Code,
            "module_Title": self.module_Title,
            "preferred_Sch_Number": self.preferred_Sch_Number,
            "assigned_Sch_Number": self.assigned_Sch_Number,
            "schedule_Start_Date": self.schedule_Start_Date,
            "schedule_End_Date": self.schedule_End_Date,
            "last_Updated_Date": self.last_Updated_Date,
            "course_code": self.course_code,
            "intake": self.intake,
        }

from datetime import datetime
from config.db import db


class StudentGroup(db.Model):
    __bind_key__ = "smart_gantry"
    __tablename__ = "student_group_temp"
    __table_args__ = {"schema": "dbo"}

    Student_ID = db.Column("Student_ID", db.String(50), primary_key=True)
    Module_Schedule = db.Column("Module_Schedule", db.String(100))
    Lec = db.Column("Lec", db.String(50))
    Lab = db.Column("Lab", db.String(50))
    Tut = db.Column("Tut", db.String(50))
    WS = db.Column("WS", db.String(50))

    def json(self):
        return {
            "Student_ID": self.Student_ID,
            "Module_Schedule": self.Module_Schedule,
            "Lec": self.Lec,
            "Lab":self.Lab,
            "Tut":self.Tut,
            "WS": self.WS,
        }

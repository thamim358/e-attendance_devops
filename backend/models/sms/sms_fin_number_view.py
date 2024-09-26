from datetime import datetime
from config.db import db


class SMS_Fin_Number_View(db.Model):
    __bind_key__ = "mysql_db"
    __table_args__ = {"schema": "psb"}
    __tablename__ = "fin_number_view"

    enquiryid = db.Column(db.Integer, name="enquiryid", primary_key=True)
    studentname = db.Column(db.String(255), name="studentname")
    fin_number = db.Column(db.Text, name="fin_number")
    openid = db.Column(db.Text, name="openid")

    def json(self):
        return {
            "enquiryid": self.enquiryid,
            "studentname": self.studentname,
            "fin_number": self.fin_number,
            "openid": self.openid,
        }
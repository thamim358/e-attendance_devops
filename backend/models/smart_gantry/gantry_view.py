from config.db import db


class PsbGantryView(db.Model):
    __bind_key__ = "smart_gantry"
    __tablename__ = "psb_gantry_view"
    __table_args__ = {"schema": "dbo"}

    employee_id = db.Column(
        "employee_id", db.Integer, primary_key=True, nullable=False
    )
    employee_name = db.Column("employee_name", db.String(256))
    employee_email = db.Column("employee_email", db.String(256))
    employee_status = db.Column("employee_status", db.String(50))
    department_name = db.Column("department_name", db.String(100))
    attendance_date = db.Column("attendance_date", db.DateTime)
    CHECK_IN_TIME = db.Column("CHECK_IN_TIME", db.DateTime)
    CHECK_OUT_TIME = db.Column("CHECK_OUT_TIME", db.DateTime)
    LOCATION = db.Column("LOCATION", db.String(100))
    person_name = db.Column("person_name", db.String(200))

    def json(self):
        return {
            "employee_id": self.employee_id,
            "employee_name": self.employee_name,
            "employee_email": self.employee_email,
            "employee_status": self.employee_status,
            "department_name": self.department_name,
            "attendance_date": (
                self.attendance_date.isoformat()
                if self.attendance_date
                else None
            ),
            "CHECK_IN_TIME": (
                self.CHECK_IN_TIME.isoformat() if self.CHECK_IN_TIME else None
            ),
            "CHECK_OUT_TIME": (
                self.CHECK_OUT_TIME.isoformat()
                if self.CHECK_OUT_TIME
                else None
            ),
            "LOCATION": self.LOCATION,
            "person_name": self.person_name,
        }

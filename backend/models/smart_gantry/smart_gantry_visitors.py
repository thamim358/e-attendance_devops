from config.db import db


class VisitorView(db.Model):
    __bind_key__ = "smart_gantry"
    __tablename__ = "psb_visitor_view"
    __table_args__ = {"schema": "dbo"}

    employee_id = db.Column(
        "employee_id", db.Integer, primary_key=True, nullable=False
    )
    employee_name = db.Column("employee_name", db.String(256), nullable=False)
    employee_email = db.Column("employee_email", db.String(256))
    employee_status = db.Column("employee_status", db.String(50))
    department_name = db.Column("department_name", db.String(256))
    attendance_date = db.Column("attendance_date", db.BigInteger)
    check_in_time = db.Column("check_in_time", db.BigInteger)
    check_out_time = db.Column("check_out_time", db.BigInteger)
    location = db.Column("location", db.String(256))
    person_name = db.Column("person_name", db.String(256))

    def to_dict(self):
        return {
            "employee_id": self.employee_id,
            "employee_email": self.employee_email,
            "location": self.location,
            "department_name": self.department_name,
            "employee_status": self.employee_status,
            "attendance_date": self.attendance_date,
            "check_in_time": self.check_in_time,
            "check_out_time": self.check_out_time,
            "person_name": self.person_name,
        }

from datetime import datetime
from config.db import db


class employee(db.Model):
    __bind_key__ = "smart_gantry"
    __tablename__ = "employee_view_new"
    __table_args__ = {"schema": "dbo"}

    id= db.Column("id", db.Integer, primary_key=True, nullable=False)
    department = db.Column("department", db.Integer)
    department_name = db.Column("department_name", db.String(100))
    employee_name = db.Column("employee_name", db.String(256))
    staff_id = db.Column("staff_id", db.String(256))
    email = db.Column("email", db.String(256))
    status = db.Column("status", db.String(50))
    location = db.Column("location", db.String(100))
    temperature = db.Column("temperature", db.String(50))

    def json(self):
        return {
            "id": self.id,
            "department": self.department,
            "department_name": self.department_name,
            "employee_name": self.employee_name,
            "email": self.email,
            "staff_id":self.staff_id,
            "status": self.status,
            "location": self.location,
            "temperature": self.temperature,
        }

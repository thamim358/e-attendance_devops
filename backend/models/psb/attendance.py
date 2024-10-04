from datetime import datetime
from config.db import db


class Attendance(db.Model):

    __table_args__ = {"schema": "dbo"}
    __tablename__ = "attendance"

    attendance_id = db.Column(db.Integer, primary_key=True)
    attendance_type = db.Column(db.String(255))
    student_id = db.Column(db.String(255))
    student_name = db.Column(db.String(255))
    attendance_status = db.Column(db.String(255))
    join_time = db.Column(db.DateTime)
    leave_time = db.Column(db.DateTime)
    total_time = db.Column(db.Integer)
    module_id = db.Column(
        db.String, db.ForeignKey("dbo.module_master.module_code")
    )
    module = db.relationship(
        "Module", backref=db.backref("attendance", lazy=True)
    )
    country_name = db.Column(db.String(255))
    domicile = db.Column(db.String(255))
    enrollment_id = db.Column(db.String(255))
    enrollment_status = db.Column(db.String(255))
    context_identifier = db.Column(db.String(255))
    student_email = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(255))
    last_modified_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_modified_by = db.Column(db.String(255))
    nric_fin = db.Column(db.String(255))
    # course_code = db.Column(db.String(255))
    course_code = db.Column(
        db.String, db.ForeignKey("dbo.course_master_temp.course_code")
    )
    course = db.relationship(
        "CourseMasterTemp",
        backref=db.backref("attendance", lazy=True),
        primaryjoin="Attendance.course_code == CourseMasterTemp.course_code",
    )
    course_cohort_name = db.Column(db.String(255))
    student_dob = db.Column(db.Date)
    domicile = db.Column(db.String(255))
    activity_name = db.Column(db.String(255))

    def json(self):
        return {
            "attendance_id": self.attendance_id,
            "attendance_type": self.attendance_type,
            "student_id": self.student_id,
            "student_name": self.student_name,
            "course_cohort_name": self.course_cohort_name,
            "attendance_status": self.attendance_status,
            "join_time": (
                self.join_time.isoformat() if self.join_time else None
            ),
            "leave_time": (
                self.leave_time.isoformat() if self.leave_time else None
            ),
            "total_time": self.total_time,
            "module_id": self.module_id,
            "course_code": self.course_code,
            "module_title": self.module.module_title if self.module else None,
            "country_name": self.country_name,
            "domicile": self.domicile,
            "country_id": self.country_id,
            "enrollment_id": self.enrollment_id,
            "enrollment_status": self.enrollment_status,
            "context_identifier": self.context_identifier,
            "student_email": self.student_email,
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
            "nric_fin": self.nric_fin,
            "course_code": self.course_code,
            "course_cohort_name": self.course_cohort_name,
            "student_dob": self.student_dob,
            "domicile": self.domicile,
            "activity_name": self.activity_name,
        }

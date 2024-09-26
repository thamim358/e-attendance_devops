from datetime import datetime
from config.db import db


class SMS_F7_View(db.Model):
    __bind_key__ = "mysql_db"
    __table_args__ = {"schema": "psb"}
    __tablename__ = "f7_view"

    # Define multiple columns as a composite key if applicable
    student_term_course_mapping_id = db.Column(
        db.Integer, name="studentTermCourseMappingId"
    )
    app_number = db.Column(db.String(255), name="App Number")
    student_name = db.Column(db.String(255), name="StudentName")
    course_code = db.Column(db.String(255), name="CourseCode")
    enrollment_date = db.Column(db.String(255), name="Enrollment Date")
    course_name = db.Column(db.String(255), name="CourseName")
    university_code = db.Column(db.String(255), name="UniversityCode")
    intake = db.Column(db.String(255), name="Intake")
    module_code = db.Column(db.String(255), name="ModuleCode")
    module_name = db.Column(db.String(255), name="ModuleName")
    module_fee = db.Column(db.Numeric(10, 2), name="ModuleFee")
    gst = db.Column(db.Numeric(10, 2), name="GST")
    module_start_date = db.Column(db.String(255), name="ModuleStartDate")
    module_end_date = db.Column(db.String(255), name="ModuleEndDate")
    module_status = db.Column(db.String(255), name="ModuleStatus")
    moved_status = db.Column(db.String(255), name="MovedStatus")

    __mapper_args__ = {
        "primary_key": [
            student_term_course_mapping_id,
        ]
    }

    def json(self):
        return {
            "student_term_course_mapping_id": self.student_term_course_mapping_id,
            "app_number": self.app_number,
            "student_name": self.student_name,
            "course_code": self.course_code,
            "enrollment_date": self.enrollment_date,
            "course_name": self.course_name,
            "university_code": self.university_code,
            "intake": self.intake,
            "module_code": self.module_code,
            "module_name": self.module_name,
            "module_fee": str(self.module_fee),
            "gst": str(self.gst),
            "module_start_date": self.module_start_date,
            "module_end_date": self.module_end_date,
            "module_status": self.module_status,
            "moved_status": self.moved_status,
        }

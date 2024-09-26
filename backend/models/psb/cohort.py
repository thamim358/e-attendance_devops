from datetime import datetime
from config.db import db


class CohortModule(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "cohort"

    cohort_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer)
    module_id = db.Column(db.Integer)
    course_cohort = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    created_by = db.Column(db.String(255), nullable=False)
    last_modified_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    last_modified_by = db.Column(db.String(255), nullable=False)
    student_id = db.Column(db.String(255), nullable=False)

    def json(self):
        return {
            "cohort_id": self.cohort_id,
            "course_id": self.course_id,
            "module_id": self.module_id,
            "course_cohort": self.course_cohort,
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
            "student_id": self.student_id,
        }

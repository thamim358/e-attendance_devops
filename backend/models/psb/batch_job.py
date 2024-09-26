from datetime import datetime

from sqlalchemy.dialects.postgresql import JSON
from config.db import db


class BatchJob(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "batchjob"

    batchjob_id = db.Column(db.Integer, primary_key=True)
    batchjob_name = db.Column(db.String(255))
    batchjob_start_time = db.Column(db.DateTime)
    batchjob_end_time = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    batchjob_date = db.Column(db.Date)
    failed_reports = db.Column(JSON)
    batch_job_status = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)
    created_by = db.Column(db.String(255))
    last_modified_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    last_modified_by = db.Column(db.String(255))

    def json(self):
        return {
            "batchjob_id": self.batchjob_id,
            "batchjob_name": self.batchjob_name,
            "batchjob_start_time": (
                self.batchjob_start_time.isoformat()
                if self.batchjob_start_time
                else None
            ),
            "batchjob_end_time": (
                self.batchjob_end_time.isoformat()
                if self.batchjob_end_time
                else None
            ),
            "batchjob_date": (
                self.batchjob_date.isoformat() if self.batchjob_date else None
            ),
            "failed_reports": self.failed_reports,
            "batch_job_status": self.batch_job_status,
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
        }

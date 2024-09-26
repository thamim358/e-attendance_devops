from datetime import datetime
from config.db import db


class InternationalStudents(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "school_master_temp"

    id = db.Column(db.Integer, primary_key=True)
    bu = db.Column(db.String(255))
    name = db.Column(db.String(255))
    code = db.Column(db.String(255))
    # created_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    # created_by = db.Column(db.String(255))
    # last_modified_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    # last_modified_by = db.Column(db.String(255))

    def json(self):
        return {
            "school_id": self.id,
            "school_bu": self.bu,
            "school_name": self.name,
            "school_code": self.code,
            # "created_at": self.created_at.isoformat() if self.created_at else None,
            # "created_by": self.created_by,
            # "last_modified_at": self.last_modified_at.isoformat() if self.last_modified_at else None,
            # "last_modified_by": self.last_modified_by,
        }

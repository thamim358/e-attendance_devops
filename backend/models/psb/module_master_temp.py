from datetime import datetime
from config.db import db


class ModuleMasterTemp(db.Model):
    __table_args__ = {"schema": "dbo"}
    __tablename__ = "module_master_temp"

    id = db.Column(db.Integer, primary_key=True)
    module_code = db.Column(db.String(255))
    module_title = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)
    created_by = db.Column(db.String(255))
    last_modified_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    last_modified_by = db.Column(db.String(255))

    def json(self):
        return {
            "id": self.id,
            "module_code": self.module_code,
            "module_title": self.module_title,
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

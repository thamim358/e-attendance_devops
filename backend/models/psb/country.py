from datetime import datetime
from config.db import db


class Country(db.Model):
    __table_args__ = {"schema": "psb"}
    __tablename__ = "country_master"

    country_id = db.Column(db.Integer, primary_key=True)
    country_name = db.Column(db.String(255))
    country_code = db.Column(db.String(255))
    created_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    created_by = db.Column(db.String(255))
    last_modified_at = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    last_modified_by = db.Column(db.String(255))
    citizenship = db.Column(db.String(255))

    def json(self):
        return {
            "country_id": self.country_id,
            "country_name": self.country_name,
            "country_code": self.country_code,
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
            "citizenship": self.citizenship,
        }

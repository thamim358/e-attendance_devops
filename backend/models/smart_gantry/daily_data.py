from config.db import db


class DailyDataView(db.Model):
    __bind_key__ = "smart_gantry"
    __tablename__ = "daily_check_in_out_latest_index"
    __table_args__ = {"schema": "dbo"}

    ID = db.Column("ID", db.Integer, primary_key=True, nullable=False)
    NAME = db.Column("NAME", db.String(200), nullable=True)
    STUDENT_ID = db.Column("STUDENT_ID", db.String(50), nullable=True)
    SITEID = db.Column("SITEID", db.Integer, nullable=True)
    CHECK_IN_TIME = db.Column("CHECK_IN_TIME", db.BigInteger, nullable=True)
    CHECK_OUT_TIME = db.Column("CHECK_OUT_TIME", db.BigInteger, nullable=True)
    LOCATION = db.Column("LOCATION", db.String(100), nullable=True)
    event_date = db.Column("event_date", db.Date, nullable=True)

    def json(self):
        return {
            "id": self.ID,
            "name": self.NAME,
            "student_id": self.STUDENT_ID,
            "site_id": self.SITEID,
            "check_in_time": self.CHECK_IN_TIME,
            "check_out_time": self.CHECK_OUT_TIME,
            "location": self.LOCATION,
            "event_date": (
                self.event_date.isoformat() if self.event_date else None
            ),
        }

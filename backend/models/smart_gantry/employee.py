from config.db import db


class SmartGantryEmployees(db.Model):
    __bind_key__ = "smart_gantry"
    __tablename__ = "employees"
    __table_args__ = {"schema": "dbo"}

    id = db.Column("id", db.Integer, primary_key=True, nullable=False)
    name = db.Column("name", db.String(256), nullable=False)
    alias = db.Column("alias", db.String(256))
    sex = db.Column("sex", db.String(1))
    image = db.Column("image", db.Text)
    email = db.Column("email", db.String(256))
    mobile = db.Column("mobile", db.String(50))
    status = db.Column("status", db.String(50))
    department = db.Column("department", db.String(5))
    staff_id = db.Column("staff_id", db.String(50))
    nric = db.Column("nric", db.String(50))
    passport = db.Column("passport", db.String(50))
    user_id = db.Column("user_id", db.Integer)
    device_face_id = db.Column("device_face_id", db.String(100))
    safe_entry_url = db.Column("safe_entry_url", db.Text)
    subscriber_id = db.Column("subscriber_id", db.String(50))
    created_at = db.Column("created_at", db.DateTime)
    updated_at = db.Column("updated_at", db.DateTime)

    def json(self):
        return {
            "id": self.id,
            "name": self.name,
            "alias": self.alias,
            "sex": self.sex,
            "image": self.image,
            "email": self.email,
            "mobile": self.mobile,
            "status": self.status,
            "department": self.department,
            "staff_id": self.staff_id,
            "nric": self.nric,
            "passport": self.passport,
            "user_id": self.user_id,
            "device_face_id": self.device_face_id,
            "safe_entry_url": self.safe_entry_url,
            "subscriber_id": self.subscriber_id,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),
        }

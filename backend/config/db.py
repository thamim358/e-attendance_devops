from flask_sqlalchemy import SQLAlchemy
import os

from utils.config.secrets import get_driver_version, get_secrets

db = SQLAlchemy()


def initialize_db(app):

    secret_value = get_secrets()
    driver_info = get_driver_version()
    psb_connection_string = (
        f"{secret_value['PSB_DB_URL']}?driver={driver_info}"
    )
    sms_connection_string = f"{secret_value['SMS_DB_URL']}"
    rdb_connection_string = f"{secret_value['RDB_URL']}?driver={driver_info}"
    smart_gantry_connection_string = (
        f"{secret_value['SMART_GANTRY_DB_URL']}?driver={driver_info}"
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = psb_connection_string
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_BINDS"] = {
        "mysql_db": sms_connection_string,
        "rdb_db": rdb_connection_string,
        "smart_gantry": smart_gantry_connection_string,
    }
    db.init_app(app)
    return db

from logging import log
import logging
from flask_sqlalchemy import SQLAlchemy
import os

from utils.config.secrets import get_driver_version, get_secrets

db = SQLAlchemy()
log = logging.getLogger("psb_academy_logger")

def initialize_db(app):

    # Assume get_driver_version() gets driver version properly
    driver_info = get_driver_version()
    # Fetch environment variables correctly
    psb_connection_string = os.environ.get("DB_URL_PSB")
    sms_connection_string = os.environ.get("DB_URL")
    rdb_connection_string = os.environ.get("DB_URL_RDB2024")
    smart_gantry_connection_string = os.environ.get("DB_URL_SMART_GANTRY")

    # Build the connection strings by appending the driver version
    db_url = f"{psb_connection_string}?driver={driver_info}" if psb_connection_string else None
    db_url_mysql = f"{sms_connection_string}?driver={driver_info}" if sms_connection_string else None
    db_url_rdb2024 = f"{rdb_connection_string}?driver={driver_info}" if rdb_connection_string else None
    db_url_smart_gantry = f"{smart_gantry_connection_string}?driver={driver_info}" if smart_gantry_connection_string else None

    # Set database URLs in app configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_BINDS"] = {
        "mysql_db": db_url_mysql,
        "rdb_db": db_url_rdb2024,
        "smart_gantry": db_url_smart_gantry,
    }

    # Initialize the database
    db.init_app(app)
    return db

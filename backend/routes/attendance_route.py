from controllers.attendance_controller import * 
from flask import Blueprint

attendance_routes = Blueprint("attendance_routes", __name__)

@attendance_routes.route("/attendance", methods=["GET"])
def get_all_attendance_route():
    return get_all_attendances()
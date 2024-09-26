from flask import Blueprint, request
from controllers.filters_controller import *

filter_routes = Blueprint("filter_routes", __name__)

@filter_routes.route("/filter_attendance", methods=["POST"])
def get_student_attendance_filter_route():  
    return get_student_attendance_filter()

@filter_routes.route("/module_filter", methods=["POST"])
def get_module_attendance_filter_route():  
    return get_module_attendance_filter()



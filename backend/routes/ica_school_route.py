from flask import Blueprint
from controllers.ica_course_controller import *
from controllers.ica_school_controller import *
from controllers.sms_countries_controllers import *
from controllers.ica_students_controller import *


ica_school_routes = Blueprint("ica_school_routes", __name__)


@ica_school_routes.route("/schools", methods=["GET"])
def get_all_schools_route():
    return get_all_schools()


@ica_school_routes.route("/get_course/<string:school_id>", methods=["GET"])
def get_school_by_course_route(school_id):
    return get_courses_by_school_code(school_id)


@ica_school_routes.route("/get_sms_countries", methods=["GET"])
def get_all_countries():
    return get_all_sms_countries()


@ica_school_routes.route("/ica_filter", methods=["POST"])
def get_ica_attendance_filter_route():
    return get_ica_attendance_filter()


@ica_school_routes.route("/ica_students", methods=["POST"])
def get_all_ica_students_route():
    return get_all_ica_students()

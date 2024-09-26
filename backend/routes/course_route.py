from controllers.course_controller import *
from flask import Blueprint

course_routes = Blueprint("course_routes", __name__)

@course_routes.route("/courses", methods=["GET"])
def get_all_courses_route():
    return get_all_courses()

@course_routes.route("/course/module", methods=["POST"])
def get_module_by_course_id_route():
    return get_module_by_course_id()

@course_routes.route("/cohort_course", methods=["POST"])
def get_cohort_course_route():
    return get_cohort_course()

@course_routes.route("/school/module", methods=["POST"])
def get_school_by_modules_route():
    return get_school_by_modules()

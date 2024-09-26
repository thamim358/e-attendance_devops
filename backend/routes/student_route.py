from utils.common.upload_excel_student import *
from controllers.student_controller import *
from flask import Blueprint, app, request

student_routes = Blueprint("student_routes", __name__)


@student_routes.route("/student_names", methods=["GET"])
def get_all_students_route():
    return get_all_students()


@student_routes.route("/student", methods=["POST"])
def get_by_student_view_details_route():
    return get_by_student_view_details()

@student_routes.route("/module_view", methods=["POST"])
def get_by_module_view_details_routes():
    return get_by_module_view_details()



@student_routes.route("/ica_student_detail", methods=["POST"])
def get_by_student_route():
    return get_by_ica_student()


@student_routes.route("/upload_student_excel", methods=["POST"])
def upload_student_excel_route():
    return upload_student_excel_entry()


@student_routes.route("/get_student_modules", methods=["POST"])
def get_all_student_module_route():
    data = request.json if request.json else {}
    student_id = data.get("student_id")
    if not student_id:
        return jsonify({"message": "Student ID is required"}), 400
    return get_all_student_module(student_id)

@student_routes.route("/student_name_list", methods=["POST"])
def get_school_by_students_route():
    return get_school_by_students()

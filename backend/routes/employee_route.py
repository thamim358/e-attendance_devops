from controllers.employee_controller import *
from flask import Blueprint, app, request

employee_routes = Blueprint("employee_routes", __name__)


@employee_routes.route("/get_all_employee", methods=["POST"])
def get_all_employee_route():
    filters = request.json if request.json else {}
    return get_all_employees(filters)


@employee_routes.route("/get_all_locations", methods=["GET"])
def get_all_locations_route():
    return get_all_locations()

@employee_routes.route("/get_all_departments", methods=["GET"])
def get_all_departments_route():
    return get_all_departments()

@employee_routes.route("/get_employee_filter", methods=["GET"])
def get_employee_filter_route():
    return get_employee_filter()

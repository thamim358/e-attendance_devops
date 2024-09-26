from controllers.sms_module_controller import get_all_sms_modules
from flask import Blueprint

sms_module_route = Blueprint("sms_module_route", __name__)


@sms_module_route.route("/sms_module/<string:Course_Code>", methods=["GET"])
def get_all_sms_modules_routes(Course_Code):
    return get_all_sms_modules(Course_Code)

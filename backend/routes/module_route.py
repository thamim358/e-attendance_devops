from controllers.module_controller import get_all_modules
from flask import Blueprint

module_routes = Blueprint("module_routes", __name__)

@module_routes.route("/module", methods=["GET"])
def get_all_modules_route():
    return get_all_modules()

from controllers.country_controller import *
from flask import Blueprint, app

country_routes = Blueprint("country_routes", __name__)

@country_routes.route("/country", methods=["GET"])
def get_all_countries_route():
    return get_all_countries()
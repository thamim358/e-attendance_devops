from flask import Blueprint
from flask import request
from controllers.visitor_controller import *


visitor_routes = Blueprint("visitor_routes", __name__)


@visitor_routes.route("/search_visitors", methods=["GET"])
def search_visitors_routes():
    return search_visitors()


@visitor_routes.route("/filter_visitor", methods=["POST"])
def visitor_filter_routes():
    return visitor_filter()
import logging

from flask import jsonify, logging, make_response

import logging

from models.psb.country import Country

# Set up logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


def get_all_countries():
    try:
        countries = Country.query.all()
        countries_list = [country.json() for country in countries]
        return jsonify({"countries": countries_list})
    except Exception as e:
        log.info(f"Error fetching countries: {str(e)}")
        return make_response(
            jsonify({"message": "Error fetching countries"}), 500
        )

import logging
from flask import jsonify, make_response

from models.sms.sms_cv001_view import SMS_CV001_View

log = logging.getLogger("psb_academy_logger")


def get_all_sms_countries():
    try:
        unique_countries = (
            SMS_CV001_View.query
            .with_entities(SMS_CV001_View.nationality)
            .distinct()
            .filter(SMS_CV001_View.nationality.isnot(None))
            .order_by(SMS_CV001_View.nationality)
            .all()
        )
        get_all_sms_countries_response = [
            {"country_id": idx + 1, "country_name": country[0]} 
            for idx, country in enumerate(unique_countries)
        ]
        return jsonify(get_all_sms_countries_response)
    except Exception as e:
        log.exception("Exception occurred :: error=%s", e)
        return make_response(
            jsonify({"message": "Error fetching countries"}), 500
        )

import logging

from flask import jsonify, make_response, request
from sqlalchemy.orm import load_only
from models.psb.school_master_temp import InternationalStudents


log = logging.getLogger("psb_academy_logger")


def get_all_schools():
    try:
        schools = InternationalStudents.query.with_entities(
            InternationalStudents.bu,
            InternationalStudents.code,
            InternationalStudents.id,
            InternationalStudents.name
        ).all()
        schools_list = [
            {"school_bu": bu, "school_code": code, "school_id": id, "school_name": name}
            for bu, code, id, name in schools
        ]

        return jsonify({"schools": schools_list}), 200
    except Exception as e:
        log.info(f"Error fetching schools: {str(e)}")
        return make_response(
            jsonify({"message": "Error fetching schools"}), 500
        )

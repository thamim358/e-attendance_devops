import logging

from flask import jsonify, make_response

from models.psb.module import Module


def get_all_modules():
    try:
        modules = Module.query.all()
        modules_list = [module.json() for module in modules]
        return jsonify({"modules": modules_list})
    except Exception as e:
        logging.exception("Exception occurred :: error=%s", e)
        return make_response(
            jsonify({"message": "Error fetching modules"}), 500
        )

import logging
from flask import jsonify, make_response, request
from models.sms.sms_cv001_view import SMS_CV001_View
from models.sms.sms_f7_view import SMS_F7_View

log = logging.getLogger("psb_academy_logger")

def get_all_sms_modules(Course_Code):
    try:
        # Initialize response lists and dictionaries
        sms_modules_json_responses = []
        cv_001_json_responses = []

        # Use dictionaries to track unique entries
        unique_modules = {}
        unique_cohorts = {}

        # Check if Course_Code is provided
        if Course_Code:
            # Fetch sms_modules in batches
            sms_modules_query = SMS_F7_View.query.with_entities(
                SMS_F7_View.module_code, SMS_F7_View.module_name
            ).filter_by(course_code=Course_Code).yield_per(100)

            # Fetch cv_001 cohorts in batches
            cv_001_query = SMS_CV001_View.query.with_entities(
                SMS_CV001_View.course_cohort_batch_name
            ).filter_by(course_code=Course_Code).yield_per(100)

            # Create an iterator for cv_001_query
            cv_001_iter = iter(cv_001_query)
            # Start with index 1 for cv_001_cohorts
            index = 1

            # Process sms_modules and cv_001 cohorts
            for module in sms_modules_query:
                module_key = (module.module_code, module.module_name)
                if module_key not in unique_modules:
                    unique_modules[module_key] = {
                        "module_code": module.module_code,
                        "module_name": module.module_name
                    }

            for cohort in cv_001_iter:
                cohort_key = cohort.course_cohort_batch_name
                if cohort_key not in unique_cohorts:
                    unique_cohorts[cohort_key] = {
                        "cohort_id": index,
                        "course_cohort_batch_name": cohort_key
                    }
                    index += 1

        # Convert dictionaries to lists
        sms_modules_json_responses = list(unique_modules.values())
        cv_001_json_responses = list(unique_cohorts.values())

        final_response = {
            "module_result": sms_modules_json_responses,
            "cohort_result": cv_001_json_responses,
        }

        return jsonify(final_response)

    except Exception as e:
        # Log the exception
        log.exception("Exception occurred :: error=%s", e)

        # Return an error response
        return make_response(jsonify({"message": "Error fetching data"}), 500)

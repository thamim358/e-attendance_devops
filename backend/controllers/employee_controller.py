from flask import jsonify, make_response, request
from models.smart_gantry.employee_data import employee
import logging
from sqlalchemy import and_

log = logging.getLogger("psb_academy_logger")


def get_all_employees(filters):
    try:

        if not any(
            filters.get(key, "").strip()
            for key in [
                "department_name",
                "employee_name",
                "status",
                "location",
            ]
        ):
            return jsonify({"employees": []})

        query = employee.query

        department_name = filters.get("department_name", "").strip()
        if department_name:
            query = query.filter(
                employee.department_name.ilike(f"%{department_name}%")
            )

        employee_name = filters.get("employee_name", "").strip()
        if employee_name:
            query = query.filter(
                (employee.employee_name.ilike(f"%{employee_name}%"))
                | (employee.email.ilike(f"%{employee_name}%"))
                | (employee.staff_id.ilike(f"%{employee_name}%"))
            )

        status = filters.get("status", "").strip()
        if status:
            query = query.filter(employee.status == status)

        location = filters.get("location", "").strip()
        if location:
            location_tokens = [
                f"%{token}%"
                for token in location.replace("(", "")
                .replace(")", "")
                .replace("[", "")
                .replace("]", "")
                .split()
            ]
            location_conditions = [
                employee.location.ilike(token) for token in location_tokens
            ]
            query = query.filter(and_(*location_conditions))

        employees = query.all()
        employees_list = [emp.json() for emp in employees]

        return jsonify({"employees": employees_list})

    except Exception as e:
        log.error(f"Error fetching employees: {str(e)}")
        return make_response(
            jsonify({"message": "Error fetching employees"}), 500
        )


def get_all_locations():
    try:
        locations = (
            employee.query.with_entities(employee.location).distinct().all()
        )
        locations_list = [loc[0] for loc in locations if loc[0]]
        return jsonify({"locations": locations_list})

    except Exception as e:
        log.error(f"Error fetching locations: {str(e)}")
        return make_response(
            jsonify({"message": "Error fetching locations"}), 500
        )


def get_all_departments():
    try:
        departments = (
            employee.query.with_entities(employee.department_name)
            .distinct()
            .all()
        )
        departments_list = [department[0] for department in departments]
        return jsonify({"departments": departments_list})

    except Exception as e:
        log.error(f"Error fetching locations: {str(e)}")
        return make_response(
            jsonify({"message": "Error fetching department name"}), 500
        )
    
def get_employee_filter ():
    try:
        employees = employee.query.all()
        employees_list = [
            {"employee_name": emp.employee_name, "email": emp.email, "staff_id": emp.staff_id}
            for emp in employees
        ]
        return jsonify({"employees": employees_list})

    except Exception as e:
        log.error(f"Error fetching employees: {str(e)}")
        return make_response(jsonify({"message": "Error fetching employees"}), 500)
    

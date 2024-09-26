from flask import jsonify, make_response, request
import logging

from sqlalchemy import and_
from utils.common.general import convert_from_unix_timestamp, convert_to_unix_timestamp

from sqlalchemy.orm import load_only
from config.db import db
from models.smart_gantry.smart_gantry_visitors import VisitorView


log = logging.getLogger("psb_academy_logger")


def search_visitors():
    search_name = request.args.get("name")
    search_email = request.args.get("email")

    try:
        query = db.session.query(
            VisitorView.person_name,
            VisitorView.employee_email
        )

        if search_name:
            query = query.filter(
                VisitorView.person_name.ilike(f"%{search_name}%")
            )
        if search_email:
            query = query.filter(
                VisitorView.employee_email.ilike(f"%{search_email}%")
            )

        results = query.all()
        
        seen = set()
        visitors_list = []
        for person_name, email in results:
            if (person_name, email) not in seen:
                seen.add((person_name, email))
                visitors_list.append({
                    "person_name": person_name,
                    "email": email,
                })

        return jsonify({"visitors": visitors_list})

    except Exception as e:
        log.error(
            f"Unexpected error while fetching visitors: {str(e)}",
            exc_info=True,
        )
        return make_response(
            jsonify(
                {
                    "message": "An unexpected error occurred while fetching visitors"
                }
            ),
            500,
        )

def visitor_filter():
    try:
        data = request.json
        log.info(f"Received payload: {data}")

        employeeStatus = data.get("employee_status")
        personName = data.get("person_name")
        fromDate = data.get("from_date")
        toDate = data.get("to_date")

        query = VisitorView.query

        if employeeStatus:
            query = query.filter_by(employee_status=employeeStatus)

        if personName:
            query = query.filter(
                (VisitorView.person_name.ilike(f"%{personName}%"))
                | (VisitorView.employee_email.ilike(f"%{personName}%"))
            )

        if fromDate and toDate:
            try:
                fromDateUnix = convert_to_unix_timestamp(fromDate)
                toDateUnix = convert_to_unix_timestamp(toDate)
                log.info("fromDate in Unix timestamp :: %s", fromDateUnix)
                log.info("toDate in Unix timestamp : %s", toDateUnix)

                query = query.filter(
                    and_(
                        VisitorView.attendance_date >= fromDateUnix,
                        VisitorView.attendance_date <= toDateUnix
                    )
                )
            except ValueError as e:
                log.error(f"Error parsing date: {e}")
                return make_response(jsonify({"message": "Invalid date format"}), 400)
            
        visitors = query.all()
        log.info(f"Number of visitors found: {len(visitors)}")

        visitors_list = []
        for visitor in visitors:
            checkInTimeDB = visitor.check_in_time
            log.info("Employee ID :: %s", visitor.employee_id)
            log.info("checkInTime from DB : %s", checkInTimeDB)
            checkInTimeUI = convert_from_unix_timestamp(checkInTimeDB)
            log.info("checkInTime to be displayed in UI : %s", checkInTimeUI)
            checkOutTimeDB = visitor.check_out_time
            log.info("checkOutTimeDB from DB : %s", checkOutTimeDB)
            checkOutTimeUI = convert_from_unix_timestamp(checkOutTimeDB)
            log.info("checkOutTimeDB to be displayed in UI : %s", checkOutTimeUI)

            visitors_list.append(
                {
                    "employee_id": visitor.employee_id,
                    "employee_email": visitor.employee_email,
                    "location": visitor.location,
                    "department_name": visitor.department_name,
                    "employee_status": visitor.employee_status,
                    "attendance_date": visitor.attendance_date,
                    "check_in_time": checkInTimeUI,
                    "check_out_time": checkOutTimeUI,
                    "person_name": visitor.person_name,
                }
            )

        return jsonify({"visitors": visitors_list})

    except Exception as e:
        log.error(f"Error occurred while searching visitors: {str(e)}")
        return make_response(
            jsonify({"message": "Error occurred while searching visitors"}), 500
        )

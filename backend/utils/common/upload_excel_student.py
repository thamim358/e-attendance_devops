from flask import request, jsonify, Blueprint
from models.smart_gantry.student_group import StudentGroup
from config.db import db
import pandas as pd
import logging

logger = logging.getLogger(__name__)

# Define required columns
REQUIRED_COLUMNS = {'Student ID', 'Module Schedule#', 'Lec', 'Lab', 'Tut', 'WS'}

def upload_student_excel_entry():
    try:

        if 'file' not in request.files:
            return jsonify(error="No file part in the request"), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify(error="No file selected"), 400

        data_frame = pd.read_excel(file, engine='openpyxl')

        data_frame = data_frame.fillna('')


        uploaded_columns = set(data_frame.columns)
        missing_columns = REQUIRED_COLUMNS - uploaded_columns
        if missing_columns:
            return jsonify(error=f"Template is incorrect. Missing columns: {', '.join(missing_columns)}"), 404

        data_list = data_frame.to_dict(orient='records')

        students_group = [
            StudentGroup(
                Student_ID=row.get('Student ID'),
                Module_Schedule=row.get('Module Schedule#'),
                Lec=row.get('Lec', ''),
                Lab=row.get('Lab', ''),
                Tut=row.get('Tut', ''),
                WS=row.get('WS', '')
            )
            for row in data_list
        ]

        db.session.add_all(students_group)
        db.session.commit()

        logger.info("Database populated successfully.")
        return jsonify(message="Database populated successfully.")

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        db.session.rollback()
        return jsonify(error=f"An error occurred: {e}"), 500


def get_all_student_module(student_id):
    try:
        student = StudentGroup.query.filter_by(Student_ID=student_id).first()

        if not student:
            return jsonify({"student_module": []})

        return jsonify({"student_module": [student.json()]})

    except Exception as e:
        logger.error(f"An error occurred while fetching data: {e}")
        return jsonify({"error": f"An error occurred: {e}"}), 500

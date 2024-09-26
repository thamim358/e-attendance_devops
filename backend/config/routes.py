import logging

# Import and register the routes from the route blueprints
from routes.student_route import student_routes
from routes.course_route import course_routes
from routes.country_route import country_routes
from routes.module_route import module_routes
from routes.attendance_route import attendance_routes
from routes.filters_route import filter_routes
from routes.batch_job_route import batch_job
from routes.ica_school_route import ica_school_routes
from routes.sms_module_route import sms_module_route
from routes.visitor_route import visitor_routes
from routes.employee_route import employee_routes

from controllers.batch_job_controller import get_all_batch_jobs


def initialize_routes(app):
    app.register_blueprint(student_routes)
    app.register_blueprint(course_routes)
    app.register_blueprint(country_routes)
    app.register_blueprint(module_routes)
    app.register_blueprint(attendance_routes)
    app.register_blueprint(filter_routes)
    app.register_blueprint(batch_job)
    app.register_blueprint(ica_school_routes)
    app.register_blueprint(sms_module_route)
    app.register_blueprint(visitor_routes)
    app.register_blueprint(employee_routes)

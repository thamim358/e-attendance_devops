import logging
import os
import webbrowser
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from config.routes import initialize_routes
from config.db import initialize_db
from config.logging import get_logger
from config.scheduler_config import configure_scheduler
from utils.batch_job.jobs import setup_batch_jobs


def create_app():
    app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
    CORS(app)

    load_dotenv()
    logger = get_logger()
    initialize_db(app)
    initialize_routes(app)
    scheduler = configure_scheduler(app)

    with app.app_context():
        setup_batch_jobs(scheduler, app)
        scheduler.start()
        logger.info("Scheduler started successfully.")

    @app.route("/")
    def serve():
        path = os.path.join(app.static_folder, "index.html")
        if not os.path.exists(path):
            logger.error(f"index.html not found at {path}")
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/assets/<path:filename>")
    def serve_static_assets(filename):
        return send_from_directory(
            os.path.join(app.static_folder, "assets"), filename
        )

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, use_reloader=False, port=5000, threaded=True)

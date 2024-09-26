from flask import current_app
from contextlib import contextmanager
from datetime import datetime, timedelta
import pytz

from utils.batch_job.jobs_main import load_batchjob_data


@contextmanager
def job_lock(lock_name, timeout=3600):
    lock = current_app.extensions.get("redis", None)
    if not lock:
        yield True
        return

    lock_id = f"lock:{lock_name}"
    timeout_at = datetime.utcnow() + timedelta(seconds=timeout)

    status = lock.setnx(lock_id, timeout_at.isoformat())
    try:
        yield status
    finally:
        if status:
            lock.delete(lock_id)


def setup_batch_jobs(scheduler, app):
    def blackboard_job_function():
        with app.app_context():
            current_app.logger.info(
                f"Blackboard job triggered at: {datetime.now(pytz.UTC)}"
            )
            with job_lock("blackboard_batch_job") as acquired:
                if not acquired:
                    current_app.logger.info(
                        "Another instance of the blackboard job is already running. Skipping this execution."
                    )
                    return

                try:
                    current_app.logger.info("Starting gantry batch job")
                    load_batchjob_data("gantry")
                    current_app.logger.info("Gantry batch job completed")

                    # current_app.logger.info("Starting blackboard batch job")
                    # load_batchjob_data('blackboard')
                    # current_app.logger.info("Blackboard batch job completed")
                except Exception as e:
                    current_app.logger.error(
                        f"Error in blackboard batch job execution: {str(e)}"
                    )

    job = scheduler.add_job(
        blackboard_job_function,
        "cron",
        hour=12,
        minute=56,
        id="blackboard_batch_job",
        timezone=pytz.UTC,
    )

    # app.logger.info(f"Blackboard batch job scheduled to run daily at 8:59 AM UTC. Next run time: {job.next_run_time}")
    app.logger.info(f"Current UTC time: {datetime.now(pytz.UTC)}")
    app.logger.info(f"Scheduler timezone: {scheduler.timezone}")

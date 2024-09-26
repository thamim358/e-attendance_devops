from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor, ProcessPoolExecutor

from utils.batch_job.jobs_main import load_batchjob_data
from utils.config.secrets import get_driver_version, get_secrets


def configure_scheduler(app):
    executors = {
        "default": ThreadPoolExecutor(20),
        "processpool": ProcessPoolExecutor(5),
    }

    job_defaults = {"coalesce": False, "max_instances": 3}

    scheduler = BackgroundScheduler(
        executors=executors, job_defaults=job_defaults
    )

    return scheduler

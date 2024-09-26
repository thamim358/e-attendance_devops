from controllers.batch_job_controller import (
    get_all_batch_list,
    get_batchjob_by_date,
)
from flask import Blueprint, request

from utils.batch_job.jobs_main import load_batchjob_data

batch_job = Blueprint("batch_job", __name__)


@batch_job.route("/batch_job", methods=["POST"])
def get_all_batch_job_route():
    # job_type = request.args.get("job_type")
    # return load_batchjob_data(job_type)
    return load_batchjob_data()


@batch_job.route("/batchjob_id", methods=["POST"])
def get_batchjob_by_date_route():
    return get_batchjob_by_date()


@batch_job.route("/all_batch", methods=["GET"])
def get_all_batch_list_route():
    return get_all_batch_list()

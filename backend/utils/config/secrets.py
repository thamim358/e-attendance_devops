import json
import os

import boto3
import pyodbc
from botocore.exceptions import ClientError


def get_secrets():
    secret_name = os.environ.get("reports/secrets")
    region_name = os.environ.get("eu-north-1")
    aws_access_key_id = os.environ.get("AKIATG6MGFMNDQJN2ZET")
    aws_secret_access_key = os.environ.get("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")

    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region_name,
    )

    client = session.client("secretsmanager")

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e
    else:
        if "SecretString" in get_secret_value_response:
            return json.loads(get_secret_value_response["SecretString"])
        else:
            raise ValueError("Unexpected secret format")


def get_driver_version():
    drivers = [
        driver
        for driver in pyodbc.drivers()
        if driver.startswith("ODBC Driver")
    ]
    if "ODBC Driver 18 for SQL Server" in drivers:
        return "ODBC+Driver+18+for+SQL+Server"
    elif "ODBC Driver 17 for SQL Server" in drivers:
        return "ODBC+Driver+17+for+SQL+Server"
    else:
        raise Exception("No suitable ODBC Driver found")

from datetime import date, datetime, time, timezone
import pytz
from dateutil import tz
from twilio.rest import Client
import dateutil


# This function is used to remove hyphens from context identfier where there are hyphens in between them in some cases
def remove_hyphens_context_identifier(key):
    return key.replace("-", "")


# This function constructs the module time which we pass to find the attendance status. There are 2 props here where one is used to strip the schedule and other is used to strip the attendee join and end time
def construct_module_time(time=None, date=None, attendee_time=None, type=None):

    if type == "schedule":
        datetime_str = f"{date} {time}"
        dt = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")
    elif type == "attendeeTime":
        dt = datetime.strptime(attendee_time, "%Y-%m-%d %H:%M:%S")

    dt_utc = dt.replace(tzinfo=timezone.utc)
    formatted_time = dt_utc.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    return formatted_time


def epoch_to_time(epoch_ms):
    epoch_s = epoch_ms / 1000.0
    date_time_obj = datetime.utcfromtimestamp(epoch_s)

    return date_time_obj.strftime("%H:%M")


def epoch_to_date(epoch_ms):
    epoch_s = epoch_ms / 1000.0
    date_time_obj = datetime.utcfromtimestamp(epoch_s)

    return date_time_obj.strftime("%Y-%m-%d")


def parse_date(date_string):
    return datetime.strptime(date_string, "%d-%b-%y").date()


def time_str_to_time(time_str):
    return datetime.strptime(time_str, "%H:%M").time()


def convert_to_24h(time_input):
    if isinstance(time_input, str):
        return datetime.strptime(time_input, "%H:%M").time()
    elif isinstance(time_input, time):
        return time_input
    else:
        raise ValueError(f"Unsupported time format: {type(time_input)}")


def duration_to_minutes(attendee_join_time, attendee_leave_time):
    join_time = datetime.fromisoformat(
        attendee_join_time.replace("Z", "+00:00")
    )
    leave_time = datetime.fromisoformat(
        attendee_leave_time.replace("Z", "+00:00")
    )

    duration_seconds = (leave_time - join_time).total_seconds()

    # Round to the nearest minute
    return round(duration_seconds / 60)


def convert_to_sql_server_datetime(time_value):
    if isinstance(time_value, str):
        try:
            # Use dateutil to parse the string
            time_obj = dateutil.parser.parse(time_value)
        except ValueError:
            raise ValueError(f"Unsupported time format: {time_value}")
    elif isinstance(time_value, datetime):
        time_obj = time_value
    else:
        raise ValueError(f"Unsupported time type: {type(time_value)}")

    # Ensure the datetime is timezone-aware and in UTC
    if time_obj.tzinfo is None:
        time_obj = time_obj.replace(tzinfo=timezone.utc)
    else:
        time_obj = time_obj.astimezone(timezone.utc)

    # Format the datetime in a way SQL Server can understand
    return time_obj.strftime("%Y-%m-%d %H:%M:%S")


def convert_to_unix_timestamp(date_string):
    dt = datetime.strptime(date_string, "%Y-%m-%dT%H:%M:%S.%fZ")
    unix_timestamp = int(dt.timestamp() * 1000)
    return unix_timestamp


def convert_from_unix_timestamp(unix_timestamp):
    if unix_timestamp is None:
        return None

    dt_utc = datetime.fromtimestamp(unix_timestamp / 1000, tz=timezone.utc)
    local_tz = tz.tzlocal()
    dt_local = dt_utc.astimezone(local_tz)
    return dt_local.strftime("%Y-%m-%d %H:%M:%S")


def timestamp_to_date(ts, in_milliseconds=False):
    if in_milliseconds:
        ts = ts / 1000
    return datetime.fromtimestamp(ts)


def date_to_ms_timestamp(d):
    return int(
        datetime.combine(d, datetime.min.time())
        .replace(tzinfo=timezone.utc)
        .timestamp()
        * 1000
    )


def parse_student_dob(dob_value):
    if isinstance(dob_value, str):
        try:
            return datetime.strptime(dob_value, "%Y-%m-%dT%H:%M:%S.%fZ").date()
        except ValueError:
            try:
                return datetime.strptime(dob_value, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError(
                    f"Unsupported date string format: {dob_value}"
                )
    elif isinstance(dob_value, datetime):
        return dob_value.date()
    elif isinstance(dob_value, date):
        return dob_value
    else:
        raise ValueError(f"Unsupported date type: {type(dob_value)}")


def convert_to_sgt(time_str):
    utc = pytz.UTC
    sgt = pytz.timezone("Asia/Singapore")
    today = datetime.now(utc).date()
    time_obj = datetime.strptime(time_str, "%H:%M")
    dt = datetime.combine(today, time_obj.time())
    dt_utc = utc.localize(dt)
    dt_sgt = dt_utc.astimezone(sgt)
    return dt_sgt.strftime("%H:%M")


def send_sms(message):
    account_sid = "ACbb0d107a7aab292750f736d32c1ed5c4"
    auth_token = "9aec936d253960751ffba24b4430c3e3"
    client = Client(account_sid, auth_token)

    message = client.messages.create(
        body=message, from_="batch_job", to="+919965980181"
    )

    print(f"SMS sent: {message.sid}")

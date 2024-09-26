import requests
from utils.config.secrets import get_secrets


def bb_auth():
    try:
        secret_value = get_secrets()

        token_payload = {
            "grant_type": "password",
            "client_id": "test",
            "username": f"{secret_value['BLACKBOARD_USERNAME']}",
            "password": f"{secret_value['BLACKBOARD_PASSWORD']}",
        }
        print(token_payload)
        WEBTOKEN_URL = f"{secret_value['BLACKBOARD_AUTH_URL']}"

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = requests.post(
            WEBTOKEN_URL, headers=headers, data=token_payload
        )
        response.raise_for_status()
        access_token = response.json().get("access_token")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        access_token = None
    except KeyError as e:
        print(f"Missing key in secret_value: {e}")
        access_token = None
    except Exception as e:
        print(f"An error occurred: {e}")
        access_token = None
    return access_token

from functools import wraps
import time


def retry(max_attempts=3, delay=1):

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_attempts:
                print(f"attempts {attempts}")
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    if attempts == max_attempts:
                        raise e
                    time.sleep(delay)

        return wrapper

    return decorator

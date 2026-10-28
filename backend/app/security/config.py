import os
from typing import List


def get_env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def is_production() -> bool:
    return os.getenv("APP_ENV", "development").strip().lower() in {"prod", "production"}


def request_size_limit_bytes() -> int:
    raw_value = os.getenv("MAX_REQUEST_BYTES", "65536").strip()
    try:
        parsed = int(raw_value)
        return parsed if parsed > 0 else 65536
    except ValueError:
        return 65536


def get_admin_token() -> str:
    return os.getenv("MEDIMIND_ADMIN_TOKEN", "").strip()


def history_access_enabled() -> bool:
    default = not is_production()
    return get_env_bool("ENABLE_UNAUTHENTICATED_HISTORY", default)


def parse_cors_origins() -> List[str]:
    raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://localhost",
    )
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    if is_production():
        origins = [origin for origin in origins if origin != "*"]
    return origins

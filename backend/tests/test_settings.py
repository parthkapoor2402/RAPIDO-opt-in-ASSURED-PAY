import os
from unittest.mock import patch

from app.core.config import Settings, get_settings


def test_settings_default_values() -> None:
    settings = Settings()
    assert settings.app_name == "Assured Pay API"
    assert settings.app_version == "0.1.0"
    assert settings.environment == "development"
    assert settings.api_prefix == "/api"
    assert settings.buffer_amount_inr == 7
    assert settings.small_excess_ceiling_inr == 10
    assert settings.suspicious_threshold_inr == 25
    assert settings.settlement_policy_version == "0.1.0"
    assert settings.port == 8000


def test_settings_cors_origin_list_parses_comma_separated_values() -> None:
    settings = Settings(cors_origins="http://localhost:3000, http://127.0.0.1:3000")
    assert settings.cors_origin_list == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


def test_settings_loads_from_environment_variables() -> None:
    env = {
        "APP_NAME": "Test Assured Pay",
        "APP_VERSION": "9.9.9",
        "ENVIRONMENT": "test",
        "BUFFER_AMOUNT_INR": "12",
    }
    with patch.dict(os.environ, env, clear=False):
        settings = Settings()
    assert settings.app_name == "Test Assured Pay"
    assert settings.app_version == "9.9.9"
    assert settings.environment == "test"
    assert settings.buffer_amount_inr == 12


def test_get_settings_is_cached() -> None:
    get_settings.cache_clear()
    first = get_settings()
    second = get_settings()
    assert first is second
    get_settings.cache_clear()

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "SignalPulse"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://signalpulse:signalpulse@localhost:5432/signalpulse"
    database_url_sync: str = "postgresql://signalpulse:signalpulse@localhost:5432/signalpulse"

    gemini_api_key: str = ""
    openai_api_key: str = ""
    groq_api_key: str = ""

    llm_provider: str = "groq"
    llm_base_url: str = ""
    llm_model: str = "llama-3.3-70b-versatile"
    llm_api_key: str = ""

    secret_key: str = "change_this"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    apify_api_key: str = ""
    firecrawl_api_key: str = ""

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "allow"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()

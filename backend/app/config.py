"""
Central app configuration. All secrets/config come from environment
variables (loaded from .env in local dev). Never hardcode keys here.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Groq LLM config
    GROQ_API_KEY: str
    GROQ_MODEL_EXTRACT: str = "openai/gpt-oss-20b"
    GROQ_MODEL_CONTEXT: str = "openai/gpt-oss-120b"

    # Database config (Postgres)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/aivoa_complaints"

    # CORS - frontend origin during local dev
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
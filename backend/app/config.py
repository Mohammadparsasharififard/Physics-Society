import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "سامانه جامع انجمن فیزیک دبیرستان شهید بهشتی ۲"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"

    # Security & Tokens
    SECRET_KEY: str = "beheshti2-physics-association-super-secret-key-3249723984723984729384723984723894723"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite:///./physics_platform.db"

    # CORS
    ALLOWED_ORIGINS: str = "*"

    @property
    def cors_origins(self) -> List[str]:
        if self.ALLOWED_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # Initial Admin Setup
    INITIAL_ADMIN_USERNAME: str = "admin"
    INITIAL_ADMIN_EMAIL: str = "admin@beheshti2.ir"
    INITIAL_ADMIN_PASSWORD: str = "AdminPhysics1405!"

    # AI Service Configuration
    AI_PROVIDER: str = "mock"  # 'openai', 'deepseek', 'openrouter', 'ollama', 'mock'
    AI_API_KEY: str = "mock-key-for-testing"
    AI_BASE_URL: str = "https://api.openai.com/v1"
    AI_MODEL: str = "gpt-4o-mini"
    AI_TIMEOUT_SECONDS: int = 40
    AI_MAX_RETRIES: int = 2
    AI_TEMPERATURE: float = 0.2

    # Storage paths
    UPLOAD_DIR: str = "./data/uploads"
    TEXTBOOK_DIR: str = "./data/textbooks"
    MAX_UPLOAD_SIZE_MB: int = 50

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.TEXTBOOK_DIR, exist_ok=True)

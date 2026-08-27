import os

class Settings:
    PROJECT_NAME: str = "CivicAI – Unified Civic Trust & Smart Mobility Platform"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicai_secret_key_super_secure_hackathon_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civicai.db")

settings = Settings()

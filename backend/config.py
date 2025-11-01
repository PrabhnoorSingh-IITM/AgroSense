import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-env")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-too")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///agrosense.db")
    DEVICE_API_KEY = os.getenv("DEVICE_API_KEY", "device-demo-key")

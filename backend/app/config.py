import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuración base, común a todos los entornos."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-cambiar")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-cambiar")

    # Base de datos: si no hay DATABASE_URL, usamos SQLite local para desarrollo
    _db_url = os.getenv("DATABASE_URL", "").strip()
    if not _db_url:
        _db_url = "sqlite:///bside_dev.db"

    # Neon entrega 'postgresql://', SQLAlchemy 2.x prefiere 'postgresql+psycopg2://'
    if _db_url.startswith("postgresql://"):
        _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


def get_config():
    env = os.getenv("FLASK_ENV", "development").lower()
    if env == "production":
        return ProductionConfig
    return DevelopmentConfig
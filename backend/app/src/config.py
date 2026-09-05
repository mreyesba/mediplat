import os
from dotenv import load_dotenv

# Every module that needs a config value imports it from here, so .env is
# guaranteed to be loaded before it's read, regardless of import order.
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is required. "
        "Set it in .env at the repo root (see .env.example)."
    )

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is required. "
        "Set it in .env at the repo root (see .env.example)."
    )

# Off by default — flip on locally to log every SQL statement SQLAlchemy runs.
DEBUG = os.getenv("DEBUG", "False").strip().lower() in ("1", "true", "yes")

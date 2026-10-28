import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load backend/.env before reading DATABASE_URL when launched from the backend folder.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medimind.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# For SQLite, ensure check_same_thread is False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
_tables_initialized = False

def ensure_tables_initialized():
    global _tables_initialized
    if _tables_initialized:
        return
    # Import models lazily so metadata is fully populated before create_all.
    import app.models.db_models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _tables_initialized = True

def get_db():
    ensure_tables_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


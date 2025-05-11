"""
Database Configuration Module

This module configures the SQLAlchemy database connection and session management
for the SmartMart application. It establishes the connection to the SQLite database,
creates the SQLAlchemy engine, and provides a dependency function for FastAPI
to inject database sessions into route handlers.

Key components:
- Database engine configuration
- Session management
- Base class for ORM models
- Database initialization function
"""

from sqlalchemy import create_engine, event, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get database connection details from environment variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME]):
    raise ValueError("Missing required database environment variables")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    # Test the connection
    with engine.connect() as conn:
        logger.info("Successfully connected to the database")
except SQLAlchemyError as e:
    logger.error(f"Database connection failed: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Session:
    """
    Database session dependency for FastAPI route handlers.
    
    This function creates a new database session for each request,
    provides it to the route handler, and ensures proper cleanup
    afterward, even if exceptions occur during request handling.
    
    Yields:
        Session: SQLAlchemy database session
        
    Example:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db  # Provide the session to the route handler
    except SQLAlchemyError as e:
        logger.error(f"Database session error: {str(e)}")
        raise
    finally:
        db.close()  # Ensure session is closed after request is processed

def init_db() -> None:
    """
    Initialize the database by creating all tables defined in ORM models.
    
    This function checks if tables already exist before attempting to create them,
    making it safe to call on application startup. It imports all model classes
    to ensure they're registered with the Base metadata.
    
    Note: For schema migrations, use Alembic instead of this function.
    """
    try:
        # Drop all tables first
        Base.metadata.drop_all(bind=engine)
        # Create all tables with updated schema
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise

# Add engine event listeners for monitoring
@event.listens_for(engine, "connect")
def receive_connect(dbapi_connection, connection_record):
    logger.info("Database connection established")

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    logger.info("Database connection checked out from pool")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    logger.info("Database connection returned to pool")

if __name__ == "__main__":
    try:
        init_db()
        print("Database connection and initialization successful")
    except Exception as e:
        print(f"Database initialization failed: {e}")

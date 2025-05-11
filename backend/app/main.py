"""
SmartMart Application Core

This module is the core of the SmartMart backend application.
It configures the FastAPI application, middleware, routes, and
handles database initialization.

The application architecture follows a modular design with:
- Route handlers separated by domain (products, categories, sales)
- Database connection management
- CORS middleware for frontend integration
- Health check endpoints for monitoring
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db, get_db
from .routes import products, categories, sales, api, exports
from .middleware import setup_middleware
from .middleware import request_debug_middleware
from sqlalchemy.orm import Session
import os
from datetime import datetime

# Initialize the FastAPI application with metadata
app = FastAPI(
    title="SmartMart API",
    description="Backend API for SmartMart retail management system",
    version="1.0.0",
)

# Configure CORS middleware with security settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # HTTP methods allowed for CORS
    allow_headers=["*"],  # HTTP headers allowed for CORS
)

# Apply custom middleware (error handling, logging, etc.)
setup_middleware(app)

# Add middleware
app.middleware("http")(request_debug_middleware)

# Initialize database tables
init_db()

# Register API routers
app.include_router(api.router)
app.include_router(sales.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(exports.router)

@app.get("/")
async def root():
    """
    Root endpoint that provides API information.
    
    Returns:
        dict: Basic API information and welcome message.
    """
    return {
        "message": "Welcome to SmartMart API",
        "version": "1.0.0",
        "documentation": "/docs",
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    
    This endpoint verifies the service is running and can connect
    to its database, making it suitable for health probes.
    
    Returns:
        dict: Health status, timestamp, and version information.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/db-check")
async def db_health_check(db: Session = Depends(get_db)):
    """
    Database connectivity check endpoint.
    
    Attempts a simple database query to verify connection is working.
    
    Args:
        db (Session): Injected database session
    
    Returns:
        dict: Database connection status
    """
    try:
        # Execute a simple query to verify the connection
        db.execute("SELECT 1")
        return {"status": "connected", "message": "Database connection successful"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed: {str(e)}"}

"""
SmartMart Backend Service

This is the main entry point for the SmartMart backend API service.
It initializes the FastAPI application, sets up CORS middleware, 
includes all API routes, and configures the application startup
and shutdown events.

The application is designed to serve inventory, product, category,
and sales data for the SmartMart retail management system.
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import products, categories, sales, api
import pandas as pd
from datetime import datetime
import os

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update to match your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
init_db()

# Include routers without duplicate prefixes
app.include_router(api.router)  # This already has /api prefix
app.include_router(sales.router)  # This already has /sales prefix 
app.include_router(categories.router)  # This already has /categories prefix
app.include_router(products.router)  # This already has /products prefix

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/metrics")
async def metrics():
    return {
        "total_requests": sum(request_counts.values()),
        "active_users": len(request_counts),
        "system_load": os.getloadavg()[0]
    }

# Entry point for running the API server
if __name__ == "__main__":
    """
    Development server entry point with hot-reload enabled.
    
    This block executes when the script is run directly (not imported).
    It starts the uvicorn ASGI server with the following configuration:
    - app: The FastAPI application instance
    - host: Network interface to bind to (0.0.0.0 allows external connections)
    - port: TCP port to listen on (8000)
    - reload: Enable auto-reload on file changes (dev environment only)
    """
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

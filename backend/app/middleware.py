"""
Middleware Configuration Module

This module handles the setup and configuration of middleware components
for the SmartMart FastAPI application. It centralizes middleware registration
and provides a clean interface for applying multiple middleware to the app.

Middleware components include:
- Error handling middleware
- Request/response logging
- CORS configuration
- Authentication and authorization (if applicable)
"""

import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .middleware.error_handler import setup_error_handler
import os

# Configure logging for middleware
logger = logging.getLogger(__name__)

def setup_middleware(app: FastAPI) -> None:
    """
    Configure and register all middleware components for the application.
    
    This function is the central place for applying middleware to the FastAPI app.
    It ensures consistent ordering and configuration of all middleware components.
    
    Args:
        app: The FastAPI application instance
    """
    # Determine if we're in debug mode
    debug_mode = os.getenv("DEBUG", "False").lower() == "true"
    
    # Setup error handling middleware
    setup_error_handler(app, debug=debug_mode)
    
    # Register request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """
        Middleware to log details of incoming requests and their responses.
        
        Records the request path, method, processing time, and response status.
        
        Args:
            request: The incoming request
            call_next: Function to call the next middleware or route handler
            
        Returns:
            The response from the next middleware or route handler
        """
        start_time = time.time()
        
        # Log the incoming request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        # Process the request through the rest of the middleware and route handlers
        response = await call_next(request)
        
        # Calculate and log the processing time
        process_time = time.time() - start_time
        logger.info(f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        
        # Add processing time header to response
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    # Register additional middleware as needed
    
    logger.info("All middleware components have been configured.")

from fastapi import Request
import time
from datetime import datetime
import asyncio
from collections import defaultdict

request_counts = defaultdict(int)
last_request_time = defaultdict(float)
RATE_LIMIT = 100  # requests per minute

async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    current_time = time.time()
    
    if current_time - last_request_time[client_ip] >= 60:
        request_counts[client_ip] = 0
        last_request_time[client_ip] = current_time
    
    request_counts[client_ip] += 1
    if request_counts[client_ip] > RATE_LIMIT:
        return JSONResponse(
            status_code=429,
            content={"error": "Too many requests"}
        )
    
    response = await call_next(request)
    return response

async def request_debug_middleware(request: Request, call_next):
    """
    Middleware that logs request information for debugging
    """
    start_time = time.time()
    
    # Log request details
    print(f"\n--- Request: {request.method} {request.url.path}")
    print(f"    Query params: {dict(request.query_params)}")
    
    # Get response
    response = await call_next(request)
    
    # Log response details
    process_time = time.time() - start_time
    print(f"--- Response: {response.status_code} (took {process_time:.4f}s)\n")
    
    return response

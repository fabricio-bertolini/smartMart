"""
Error Handler Middleware Module

This module implements a middleware for handling errors and exceptions 
in the SmartMart FastAPI application. It provides consistent error responses
and logging for various types of exceptions.

The middleware catches exceptions, logs them appropriately, and returns
standardized error responses to clients with proper HTTP status codes.
"""

import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Union, Dict, Any, Callable
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import traceback
import json

# Configure logging for the error handler
logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware:
    """
    Middleware for handling exceptions in a consistent way.
    
    This middleware wraps the application and intercepts any unhandled exceptions,
    converting them to appropriate HTTP responses with consistent structure.
    
    Key features:
    - Detailed error logging
    - Standardized error response format
    - Different handling for different exception types
    - Production vs development mode error details
    """
    
    def __init__(self, app, debug: bool = False):
        """
        Initialize the error handler middleware.
        
        Args:
            app: The FastAPI application to wrap
            debug: Whether to include detailed error information in responses
        """
        self.app = app
        self.debug = debug
        
    async def __call__(self, scope, receive, send):
        """
        Process a request and handle any exceptions.
        
        This method is called for each request and wraps the request handling
        in a try/except block to catch and process exceptions.
        
        Args:
            scope: ASGI scope
            receive: ASGI receive function
            send: ASGI send function
        """
        if scope["type"] != "http":
            # Pass through non-HTTP requests (like WebSocket)
            await self.app(scope, receive, send)
            return
            
        # Create a new send function that we can intercept
        async def send_wrapper(message):
            await send(message)
            
        try:
            # Try to handle the request normally
            await self.app(scope, receive, send_wrapper)
        except SQLAlchemyError as e:
            # Handle database errors
            await self.handle_database_error(e, scope, receive, send)
        except Exception as e:
            # Handle all other exceptions
            await self.handle_general_exception(e, scope, receive, send)
    
    async def handle_database_error(self, exception: SQLAlchemyError, scope, receive, send):
        """
        Handle database-specific errors.
        
        Special handling for SQLAlchemy exceptions, with specific messages
        for different types of database errors.
        
        Args:
            exception: The caught SQLAlchemy exception
            scope: ASGI scope
            receive: ASGI receive function
            send: ASGI send function
        """
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_type = "Database Error"
        
        # Handle specific database error types
        if isinstance(exception, IntegrityError):
            status_code = status.HTTP_400_BAD_REQUEST
            error_type = "Data Integrity Error"
            
        # Log the error
        logger.error(f"Database error: {str(exception)}")
        if self.debug:
            logger.error(traceback.format_exc())
            
        # Create the error response
        error_response = {
            "error": error_type,
            "detail": str(exception) if self.debug else "A database error occurred.",
            "status_code": status_code
        }
        
        # Send the error response
        await self.send_error_response(error_response, status_code, send)
    
    async def handle_general_exception(self, exception: Exception, scope, receive, send):
        """
        Handle general (non-database) exceptions.
        
        Processes any exception not specifically handled elsewhere.
        
        Args:
            exception: The caught exception
            scope: ASGI scope
            receive: ASGI receive function
            send: ASGI send function
        """
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        
        # Log the error
        logger.error(f"Unhandled exception: {str(exception)}")
        if self.debug:
            logger.error(traceback.format_exc())
            
        # Create the error response
        error_response = {
            "error": "Internal Server Error",
            "detail": str(exception) if self.debug else "An unexpected error occurred.",
            "status_code": status_code
        }
        
        # Send the error response
        await self.send_error_response(error_response, status_code, send)
    
    async def send_error_response(self, error_response: Dict[str, Any], status_code: int, send):
        """
        Send a standardized error response.
        
        Creates and sends a properly formatted JSON error response with
        appropriate headers and status code.
        
        Args:
            error_response: Dictionary containing the error details
            status_code: HTTP status code to use
            send: ASGI send function
        """
        # Convert the error response to JSON
        body = json.dumps(error_response).encode("utf-8")
        
        # Send the HTTP response headers
        await send({
            "type": "http.response.start",
            "status": status_code,
            "headers": [
                [b"content-type", b"application/json"],
                [b"content-length", str(len(body)).encode()]
            ]
        })
        
        # Send the HTTP response body
        await send({
            "type": "http.response.body",
            "body": body,
            "more_body": False
        })

def setup_error_handler(app, debug: bool = False):
    """
    Configure and attach the error handler middleware to the application.
    
    Args:
        app: The FastAPI application
        debug: Whether to include detailed error information in responses
        
    Returns:
        The updated application with error handling middleware
    """
    app.middleware("http")(ErrorHandlerMiddleware(app, debug=debug))

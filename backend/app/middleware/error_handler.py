from fastapi import Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging
from typing import Callable
import traceback

logger = logging.getLogger(__name__)

async def error_handler_middleware(request: Request, call_next: Callable) -> Response:
    try:
        return await call_next(request)
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}\n{traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"error": "Database error occurred"}
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"error": "An unexpected error occurred"}
        )

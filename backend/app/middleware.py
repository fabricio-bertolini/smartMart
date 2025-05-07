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

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pandas as pd
from datetime import datetime
import os

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./smartmart.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Import routes
from app.routes import products, categories, sales
from .app.middleware import rate_limit_middleware

# Include routers
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(sales.router)

app.middleware("http")(rate_limit_middleware)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

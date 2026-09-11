from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routes import complaints

# Creates the complaints table on startup if it doesn't exist yet.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AIVOA Customer Complaint Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "AIVOA Complaint Management API"}
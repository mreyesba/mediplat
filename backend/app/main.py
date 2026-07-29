from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models

# Automatically build SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Local Dev Suite API")

# Explicit CORS isolation configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "healthy", "database": "connected via SQLite"}

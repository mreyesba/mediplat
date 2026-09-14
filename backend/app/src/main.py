from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from config import CORS_ORIGINS
# Imported so its model classes register on Base.metadata before create_all
# runs below — without this import, create_all would create zero tables.
import models
from routes import account, auth, events, patients

# Automatically build database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Local Dev Suite API")

# Explicit CORS isolation configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(account.router)
app.include_router(events.router)
app.include_router(patients.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

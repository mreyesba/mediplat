import logging
from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from pydantic import BaseModel, EmailStr
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from security import hash_password, verify_password, create_access_token, verify_access_token
from database import engine, Base, get_db
import models

# Initialize the Python standard logging configuration framework
# 'INFO' level ensures that debug-adjacent operational notes print to the shell
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend_logger")

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

# Pydantic verification models

class UserLogin(BaseModel):
    username: str
    password: str

class ValidateEmail(BaseModel):
    email: EmailStr

class ValidateUsername(BaseModel):
    username: str

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    dob: date
    sex: models.SexEnum

class PatientRegister(BaseModel):
    first_name: str
    last_name: str
    dob: date
    sex: models.SexEnum
    identifier: str

# Secure cookie validation
    
def get_current_user(request: Request) -> str:
    """Automatically extracts and validates the httpOnly cookie from incoming requests."""
    logger.info("Validating credentials.")
    print("Validating credentials")

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    username = verify_access_token(token)

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid"
        )
    
    return username


# API endpoints

@app.post("/api/login")
def user_login(response: Response, params: UserLogin, db: Session = Depends(get_db)):
    clean_username = params.username.strip().lower()

    logger.info(f"Login attempt received for username: {clean_username}")
    
    existing_user = db.query(models.UserTest).filter(
        models.UserTest.username == clean_username
    ).first()

    if existing_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials."
        )
    
    is_valid = verify_password(params.password, existing_user.password)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials."
        )
    
    token = create_access_token(username=clean_username)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,  # Crucial: Blocks JavaScript from reading or stealing the token (XSS proof)
        secure=False,   # Set to True in production to enforce HTTPS tracking context
        samesite="lax", # Blocks cross-site malicious link clicks from spoofing data (CSRF defense)
        max_age=28800   # Token life expiration in seconds (Matches 8 hours)
    )

    return {"status": "authenticated", "username": clean_username}


@app.post("/api/validate_email")
def validate_email(params: ValidateEmail, db: Session = Depends(get_db)):
    # Query the UserTest table to see if a row matches the incoming username
    clean_email = params.email.strip().lower()

    logger.info(f"Validating email existence: {clean_email}")
    
    existing_user = db.query(models.UserTest).filter(
        models.UserTest.email == clean_email
    ).first()

    # If existing_user is not None, it means the title is already in SQLite
    if existing_user:
        logger.info(f"Email check failed, - already exists: {clean_email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is associated with an account."
        )

    return {"status": "valid", "database": "Emails is available"}


@app.post("/api/validate_user")
def validate_user(params: ValidateUsername, db: Session = Depends(get_db)):
    # Query the UserTest table to see if a row matches the incoming username
    clean_username = params.username.strip().lower()

    logger.info(f"Validating username availability: {clean_username}")
    
    existing_user = db.query(models.UserTest).filter(
        models.UserTest.username == clean_username
    ).first()

    # If existing_user is not None, it means the title is already in SQLite
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username not available."
        )

    return {"status": "valid", "username": "Username is available"}



@app.post("/api/register")
def register(params: UserRegister, db: Session = Depends(get_db)):
    clean_username = params.username.strip().lower()
    clean_email = params.email.strip().lower()

    logger.info(f"Registering new user: {clean_username}")

    duplicate_check = db.query(models.UserTest).filter(
        (models.UserTest.username == clean_username) | (models.UserTest.email == clean_email)
    ).first()

    if duplicate_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed."
        )
    
    secure_hashed_password = hash_password(params.password)
    
    new_user = models.UserTest(
        username=clean_username,
        email=clean_email,
        password=secure_hashed_password
    )

    db.add(new_user)
    db.flush()

    new_user_info = models.UserInfoTest(
        user_id = new_user.id,
        first_name = params.first_name.strip(),
        last_name = params.last_name.strip(),
        dob = params.dob,
        sex = params.sex
    )
    
    db.add(new_user_info)
    db.commit()
    db.refresh(new_user)

    logger.info(f"User successfully registered with database record ID: {new_user.id}")

    return {"status": "success", "message": "Account created successfully!"}

@app.get("/api/me")
def get_authenticated_profile(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """A secure private endpoint. Only viewable if a valid httpOnly cookie is present."""
    user_info = db.query(models.UserInfoTest)\
        .join(models.UserTest, models.UserInfoTest.user_id == models.UserTest.id)\
        .filter(models.UserTest.username == current_user)\
        .first()
        
    return {
        "username": current_user, 
        "first_name": user_info.first_name if user_info else "User"
    }

@app.post("/api/logout")
def user_logout(response: Response):
    logger.info("Logout request received. Clearing session cookies.")
    
    # Overwrite the cookie with an empty string and kill it immediately
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=False,  # Set to True in production
        samesite="lax",
        max_age=0,     # 0 seconds forces the browser to delete it instantly
        expires=0
    )
    
    return {"status": "success", "message": "Logged out successfully"}

@app.post("/api/patient_register")
def patient_register(params: PatientRegister, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info("Patient register.")

    duplicate_check = db.query(models.PatientTest).filter(
        (models.PatientTest.identifier == params.identifier)
    ).first()


    if not duplicate_check:
        new_patient = models.PatientTest(
            first_name = params.first_name.strip(),
            last_name = params.last_name.strip(),
            dob = params.dob,
            sex = params.sex,
            identifier = params.identifier
        )
        
        db.add(new_patient)
        db.flush()
        db.commit()

    current_user_obj = db.query(models.UserTest).filter(
        (models.UserTest.username == current_user)
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Internal error."
        )
    
    current_user_id = current_user_obj.id

    existing_registry = db.query(models.PatientRegistryTest).filter(
        ((models.PatientRegistryTest.patient_identifier == params.identifier) &
         (models.PatientRegistryTest.provider_identifier == current_user_id))
    ).first()
        
    if not existing_registry:
        first_registry = models.PatientRegistryTest(
            patient_identifier = params.identifier,
            provider_identifier = current_user_id,
            info = "First entry"
        )

        db.add(first_registry)
        db.flush()
        db.commit()
    
    return {"status": "success", "message": "Patient registered"}

@app.get("/api/get_entry_count")
def get_entry_count(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info("Get entry count.")
    print("get count")

    current_user_obj = db.query(models.UserTest).filter(
        (models.UserTest.username == current_user)
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Internal error."
        )
    
    current_user_id = current_user_obj.id
    
    entry_count = db.query(models.PatientRegistryTest).filter(
        (models.PatientRegistryTest.provider_identifier == current_user_id)
    ).count()

    return {
        "count" : entry_count
    }

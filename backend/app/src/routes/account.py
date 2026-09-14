from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from security import get_current_user, hash_password
from config import logger
import models

router = APIRouter()

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
    role: models.UserRole

# API endpoints

@router.post("/api/validate_email")
def validate_email(
    params: ValidateEmail, 
    db: Session = Depends(get_db)
):
    # Query the User table to see if a row matches the incoming username
    clean_email = params.email.strip().lower()

    logger.info(f"Validating email existence: {clean_email}")
    
    existing_user = db.query(models.User).filter(
        models.User.email == clean_email
    ).first()

    # If existing_user is not None, it means the title is already in SQLite
    if existing_user:
        logger.info(f"Email check failed, - already exists: {clean_email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is associated with an account."
        )

    return {"status": "valid", "database": "Emails is available"}


@router.post("/api/validate_user")
def validate_user(
    params: ValidateUsername, 
    db: Session = Depends(get_db)
):
    # Query the User table to see if a row matches the incoming username
    clean_username = params.username.strip().lower()

    logger.info(f"Validating username availability: {clean_username}")
    
    existing_user = db.query(models.User).filter(
        models.User.username == clean_username
    ).first()

    # If existing_user is not None, it means the title is already in SQLite
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username not available."
        )

    return {"status": "valid", "username": "Username is available"}



@router.post("/api/register")
def register(
    params: UserRegister, 
    db: Session = Depends(get_db)
):
    clean_username = params.username.strip().lower()
    clean_email = params.email.strip().lower()

    logger.info(f"Registering new user: {clean_username}")

    duplicate_check = db.query(models.User).filter(
        (models.User.username == clean_username) | (models.User.email == clean_email)
    ).first()

    if duplicate_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed."
        )
    
    secure_hashed_password = hash_password(params.password)
    
    new_user = models.User(
        username=clean_username,
        email=clean_email,
        password=secure_hashed_password,
        role = params.role
    )

    db.add(new_user)
    db.flush()

    new_user_info = models.UserInfo(
        user_id = new_user.id,
        first_name = params.first_name.strip(),
        last_name = params.last_name.strip(),
        dob = params.dob
    )
    
    db.add(new_user_info)
    db.commit()
    db.refresh(new_user)

    logger.info(f"User successfully registered with database record ID: {new_user.id}")

    return {"status": "success", "message": "Account created successfully!"}

@router.get("/api/me")
def get_authenticated_profile(
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """A secure private endpoint. Only viewable if a valid httpOnly cookie is present."""
    user_info = db.query(models.UserInfo)\
        .join(models.User, models.UserInfo.user_id == models.User.id)\
        .filter(models.User.username == current_user)\
        .first()
        
    return {
        "username": current_user, 
        "first_name": user_info.first_name if user_info else "User"
    }
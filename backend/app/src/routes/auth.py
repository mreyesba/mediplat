from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from security import create_access_token, verify_password
from config import logger
import config
import models

router = APIRouter()

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/api/login")
def user_login(
    response: Response, 
    params: UserLogin, 
    db: Session = Depends(get_db)
):
    clean_username = params.username.strip().lower()

    logger.info(f"Login attempt received for username: {clean_username}")
    
    existing_user = db.query(models.User).filter(
        models.User.username == clean_username
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
        secure=config.IS_PRODUCTION,  # Cross-site cookies require Secure — frontend and backend are on different origins in production
        samesite="none" if config.IS_PRODUCTION else "lax",  # "none" is required for the cross-origin fetch to carry the cookie at all
        max_age=28800   # Token life expiration in seconds (Matches 8 hours)
    )

    return {"status": "authenticated", "username": clean_username}


@router.post("/api/logout")
def user_logout(response: Response):
    logger.info("Logout request received. Clearing session cookies.")
    
    # Overwrite the cookie with an empty string and kill it immediately
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=config.IS_PRODUCTION,
        samesite="none" if config.IS_PRODUCTION else "lax",
        max_age=0,     # 0 seconds forces the browser to delete it instantly
        expires=0
    )
    
    return {"status": "success", "message": "Logged out successfully"}
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status, Request
import jwt
import bcrypt
from config import SECRET_KEY

ALGORITHM = "HS256"

def hash_password(plain_password: str) -> str:
    """
    Converts plain text to a secure hash. 
    Bcrypt automatically generates a unique salt and embeds it in the output.
    """
    # Convert string to bytes
    password_bytes = plain_password.encode('utf-8')

    # Generate salt and compute hash
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)

    # Convert back to a string to store cleanly in SQLite
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plain password against the stored database hash.
    It extracts the salt from the hash automatically to verify a match.
    """
    password_bytes = plain_password.encode('utf-8')

    hashed_bytes = hashed_password.encode('utf-8')

    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(username: str, expires_delta: timedelta = timedelta(hours=8)) -> str:
    """Generates a cryptographically signed JWT token containing the username."""
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = {
        "sub": username, 
        "exp": int(expire.timestamp())
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def verify_access_token(token: str) -> str | None:
    """Decodes a JWT token. Returns the username string if valid, otherwise None."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            return None
        
        return username
    
    except jwt.PyJWTError:
        return None
    
# Secure cookie validation
    
def get_current_user(request: Request) -> str:
    """Automatically extracts and validates the httpOnly cookie from incoming requests."""
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
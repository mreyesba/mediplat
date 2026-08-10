import pytest

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.engine import Engine   
from fastapi.testclient import TestClient
from database import Base, SessionLocal
from models import UserInfoTest, SexEnum, UserTest
from main import app, get_db

# 2. Define the isolated testing engine right here
# Changing this to an in-memory database configuration
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# 🚀 FORCE SQLite to enforce Foreign Keys
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# 1. Provide a TestClient that uses our isolated database session
@pytest.fixture
def client(db):
    # This overrides your production 'get_db' with our transactional test 'db'
    def override_get_db():
        try:
            yield db
        finally:
            pass # The fixture lifecycle handles cleanup, not the endpoint

    app.dependency_overrides[get_db] = override_get_db
    
    yield TestClient(app)
    
    # Clean up overrides after the test completes so production stays safe
    app.dependency_overrides.clear()

# 3. Create a single persistent connection to keep the RAM database alive
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    connection = test_engine.connect()
    
    # This uses your real Base that all models inherit from
    Base.metadata.create_all(bind=connection)
    
    yield connection
    
    Base.metadata.drop_all(bind=connection)
    connection.close()

# 4. Provide a clean, isolated database transaction per test function
@pytest.fixture
def db():
    connection = test_engine.connect()
    transaction = connection.begin()
    
    # Bind our production session maker to the test connection
    session = SessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()  # Wipes data changes without deleting the schema
    connection.close()

# Test cases

# Test data models

def test_userinfo_valid_user(db: Session):
    # 1. Create the parent user record first
    parent_user = UserTest(
        username="john_doe",
        email="john@example.com",
        password="hashedpassword123"
    )
    db.add(parent_user)
    db.flush() # This tells SQLite to generate an auto-incrementing ID for parent_user
    
    # 2. Attach the profile to the real generated parent ID
    new_user_info = UserInfoTest(
        user_id=parent_user.id, # <-- Dynamic reference to a real user
        first_name="John",
        last_name="Doe",
        sex=SexEnum.MALE
    )
    db.add(new_user_info)
    db.flush()
    
    # 3. Assert it was saved correctly
    found = db.query(UserInfoTest).filter(UserInfoTest.user_id == parent_user.id).first()
    assert found is not None
    assert found.first_name == "John"

# Test SQL operations

def test_existing_username(db: Session):
    new_user = UserTest(
        username="test_username",
        email="test_email",
        password="dummypass1234"
    )

    db.add(new_user)

    db.commit()

    new_user2 = UserTest(
        username="test_username",
        email="test_email2",
        password="dummypass1234"
    )

    db.add(new_user2)

    with pytest.raises(IntegrityError):
        db.commit()


def test_existing_email(db: Session):
    new_user = UserTest(
        username="test_username",
        email="test_email",
        password="dummypass1234"
    )

    db.add(new_user)

    db.commit()

    new_user2 = UserTest(
        username="test_username2",
        email="test_email",
        password="dummypass1234"
    )

    db.add(new_user2)

    with pytest.raises(IntegrityError):    
        db.commit()

# --- API Route Tests ---

def test_api_registration_success(client: TestClient):
    # Package up matching payload formats using the UserRegister Pydantic requirements
    registration_payload = {
        "username": "api_user",
        "email": "api_user@example.com",
        "password": "securePassword123",
        "first_name": "Jane",
        "last_name": "Smith",
        "dob": "1995-05-15",
        "sex": SexEnum.FEMALE.value
    }
    
    response = client.post("/api/register", json=registration_payload)
    
    assert response.status_code == 200
    assert response.json() == {"status": "success", "message": "Account created successfully!"}


def test_api_login_sets_secure_cookie(client: TestClient):
    # 1. Register a distinct user cleanly via the API interface first
    registration_payload = {
        "username": "cookie_user_test",
        "email": "cookie_test@example.com",
        "password": "password123",
        "first_name": "Cookie",
        "last_name": "Monster",
        "dob": "1990-01-01",
        "sex": SexEnum.MALE.value
    }
    reg_response = client.post("/api/register", json=registration_payload)
    assert reg_response.status_code == 200
    
    # 2. Attempt login using the matching raw credential parameters
    login_payload = {
        "username": "cookie_user_test",
        "password": "password123"
    }
    response = client.post("/api/login", json=login_payload)
    
    assert response.status_code == 200
    assert response.json()["status"] == "authenticated"
    
    # 3. Verify the cookie exists in the standard client cookie jar
    assert "access_token" in response.cookies
    
    # 4. Check the raw "set-cookie" header to verify security flags
    set_cookie_header = response.headers.get("set-cookie", "")
    
    # Convert to lowercase to ensure case-insensitive matching
    assert "httponly" in set_cookie_header.lower()
    assert "samesite=lax" in set_cookie_header.lower()


def test_api_validate_username_duplicate(client: TestClient):
    # Register an initial name
    registration_payload = {
        "username": "taken_name",
        "email": "unique@example.com",
        "password": "password123",
        "first_name": "Test",
        "last_name": "Case",
        "dob": "1990-01-01",
        "sex": SexEnum.MALE.value
    }
    client.post("/api/register", json=registration_payload)
    
    # Hit validation route checking the exact same username
    validation_payload = {"username": "TAKEN_NAME "} # Test trailing space + casing normalization
    response = client.post("/api/validate_user", json=validation_payload)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Username not available."

# --- Additional API Route Tests ---

def test_api_login_invalid_credentials(client: TestClient):
    """Verify that logging in with incorrect credentials returns a 400 error."""
    # 1. Register a test user
    registration_payload = {
        "username": "auth_test_user",
        "email": "auth_test@example.com",
        "password": "correct_password123",
        "first_name": "Test",
        "last_name": "Case",
        "dob": "1990-01-01",
        "sex": SexEnum.MALE.value
    }
    client.post("/api/register", json=registration_payload)
    
    # 2. Attempt login with a bad password
    bad_login_payload = {
        "username": "auth_test_user",
        "password": "wrong_password_here"
    }
    response = client.post("/api/login", json=bad_login_payload)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid credentials."


def test_api_get_authenticated_profile_success(client: TestClient):
    """Verify that an authenticated user can cleanly fetch their own profile data via HTTP-only cookies."""
    # 1. Register a user
    registration_payload = {
        "username": "profile_user",
        "email": "profile@example.com",
        "password": "secure_password",
        "first_name": "Alex",
        "last_name": "Vance",
        "dob": "1992-08-24",
        "sex": SexEnum.FEMALE.value
    }
    client.post("/api/register", json=registration_payload)
    
    # 2. Authenticate the user to fetch the cookie jar containing the access token
    login_payload = {
        "username": "profile_user",
        "password": "secure_password"
    }
    login_response = client.post("/api/login", json=login_payload)
    assert login_response.status_code == 200
    
    # Extract the cookie jar containing the access token
    auth_cookies = login_response.cookies
    
    # 3. Request the private route while passing the active session cookie jar along
    profile_response = client.get("/api/me", cookies=auth_cookies)
    
    # 4. Verify the authorization barrier unlocked successfully
    assert profile_response.status_code == 200
    profile_data = profile_response.json()
    assert profile_data["username"] == "profile_user"
    assert profile_data["first_name"] == "Alex"


def test_api_get_profile_unauthenticated(client: TestClient):
    """Verify that requesting a private endpoint without a session cookie is blocked."""
    response = client.get("/api/me")
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_api_logout_clears_cookie(client: TestClient):
    """Verify that logging out forces the client browser to instantly expire the session cookie."""
    # 1. Authenticate a session first
    registration_payload = {
        "username": "logout_test_user",
        "email": "logout_test@example.com",
        "password": "password123",
        "first_name": "Logout",
        "last_name": "Test",
        "dob": "1990-01-01",
        "sex": SexEnum.MALE.value
    }
    client.post("/api/register", json=registration_payload)
    
    login_payload = {
        "username": "logout_test_user",
        "password": "password123"
    }
    login_response = client.post("/api/login", json=login_payload)
    assert "access_token" in login_response.cookies

    # 2. Hit the logout endpoint
    logout_response = client.post("/api/logout")
    assert logout_response.status_code == 200
    assert logout_response.json() == {"status": "success", "message": "Logged out successfully"}

    # 3. Verify that the "set-cookie" headers dictate immediate erasure
    set_cookie_header = logout_response.headers.get("set-cookie", "")
    
    # max-age=0 is the reliable, standard indicator for immediate deletion
    assert "max-age=0" in set_cookie_header.lower()



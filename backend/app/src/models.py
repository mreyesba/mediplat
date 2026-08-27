import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class SexEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    PROVIDER = "provider"
    FRONT_DESK = "front_desk"
    CLINIC_ADMIN = "clinic_admin"

class UserTest(Base):
    __tablename__ = "user_test"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PATIENT)

    # Relationships
    staff_info = relationship("UserInfoTest", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patient_profile = relationship("PatientTest", back_populates="user", uselist=False)
    events = relationship("EventTest", back_populates="creator", cascade="all, delete-orphan")

    def has_role(self, role_name: str | UserRole) -> bool:
        if isinstance(role_name, UserRole):
            return self.role == role_name
        return self.role.value == role_name or self.role == role_name

class UserInfoTest(Base):
    __tablename__ = "user_info_test"

    user_id = Column(Integer, ForeignKey("user_test.id"), primary_key=True)

    first_name = Column(String)
    last_name = Column(String)
    dob = Column(Date)

    user = relationship("UserTest", back_populates="staff_info")

class PatientTest(Base):
    __tablename__ = "patient_test"

    identifier = Column(String, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("user_test.id"), nullable=True, unique=True)
    
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    sex = Column(Enum(SexEnum), default=SexEnum.PREFER_NOT_TO_SAY)

    user = relationship("UserTest", back_populates="patient_profile")
    entries = relationship("PatientEntryTest", back_populates="patient", cascade="all, delete-orphan")

# MIGHT WANT TO UNIFY WITH USER

# 1. Updated Database Model
class PatientEntryTest(Base):
    __tablename__ = "patient_registry_test"

    id = Column(Integer, primary_key=True, autoincrement=True) # 👈 Add surrogate PK
    
    patient_identifier = Column(String, ForeignKey("patient_test.identifier"))
    
    provider_identifier = Column(Integer, ForeignKey("user_test.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    info = Column(String)

    patient = relationship("PatientTest", back_populates="entries")
    provider = relationship("UserTest")

# 1. Updated Database Model
class EventTest(Base):
    __tablename__ = "event_test"

    id = Column(Integer, primary_key=True, autoincrement=True) # 👈 Add surrogate PK

    title = Column(String)
    
    creator_id = Column(Integer, ForeignKey("user_test.id"))
    
    start = Column(DateTime(timezone=True))
    
    end = Column(DateTime(timezone=True))

    creator = relationship("UserTest", back_populates="events")

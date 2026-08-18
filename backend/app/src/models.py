import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum
from database import Base

class SexEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class UserTest(Base):
    __tablename__ = "user_test"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class UserInfoTest(Base):
    __tablename__ = "user_info_test"

    user_id = Column(String, ForeignKey("user_test.id"), primary_key=True)

    first_name = Column(String)
    last_name = Column(String)

    dob = Column(Date)
    sex = Column(Enum(SexEnum))

class PatientTest(Base):
    __tablename__ = "patient_test"

    identifier = Column(String, primary_key=True, index=True)

    first_name = Column(String)
    last_name = Column(String)

    dob = Column(Date)
    sex = Column(Enum(SexEnum))

# MIGHT WANT TO UNIFY WITH USER

class PatientRegistryTest(Base):
    __tablename__ = "patient_registry_test"

    patient_identifier = Column(String, ForeignKey("patient_test.identifier"), primary_key=True)

    provider_identifier = Column(String, ForeignKey("user_test.id"), primary_key=True)

    info = Column(String) # Adding general info field to store info for now

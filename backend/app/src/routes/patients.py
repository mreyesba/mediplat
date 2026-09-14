from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import date, datetime
from typing import List
from database import get_db
from security import get_current_user
from config import logger
import models

router = APIRouter()

class PatientRegister(BaseModel):
    first_name: str
    last_name: str
    dob: date
    sex: models.SexEnum
    identifier: str

class AddEntry(BaseModel):
    patient_identifier: str
    info: str | None = None

class EntryResponse(BaseModel):
    id: int
    patient_identifier: str
    provider_identifier: int 
    created_at: datetime
    info: str | None = None

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy ORM models (Pydantic v2)
        # Use orm_mode = True if you are on Pydantic v1

class PatientWithEntriesResponse(BaseModel):
    identifier: str
    first_name: str
    last_name: str
    dob: date
    sex: models.SexEnum
    entries: List[EntryResponse] = []  # 👈 Nested list of entries

    class Config:
        from_attributes = True

@router.post("/api/patient_register")
def patient_register(
    params: PatientRegister, 
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Patient register.")

    duplicate_check = db.query(models.Patient).filter(
        (models.Patient.identifier == params.identifier)
    ).first()


    if not duplicate_check:
        new_patient = models.Patient(
            first_name = params.first_name.strip(),
            last_name = params.last_name.strip(),
            dob = params.dob,
            sex = params.sex,
            identifier = params.identifier
        )
        
        db.add(new_patient)
        db.flush()
        db.commit()

    current_user_obj = db.query(models.User).filter(
        (models.User.username == current_user)
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Internal error."
        )
    
    current_user_id = current_user_obj.id

    existing_entry = db.query(models.PatientEntry).filter(
        ((models.PatientEntry.patient_identifier == params.identifier) &
         (models.PatientEntry.provider_identifier == current_user_id))
    ).first()
        
    if not existing_entry:
        first_entry = models.PatientEntry(
            patient_identifier = params.identifier,
            provider_identifier = current_user_id,
            info = "First entry"
        )

        db.add(first_entry)
        db.flush()
        db.commit()
    
    return {"status": "success", "message": "Patient registered"}

@router.post("/api/add_entry")
def add_entry(
    params: AddEntry, 
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Patient register.")

    patient = db.query(models.Patient).filter(
        (models.Patient.identifier == params.patient_identifier)
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed."
        )

    current_user_obj = db.query(models.User).filter(
        (models.User.username == current_user)
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Internal error."
        )
    
    current_user_id = current_user_obj.id

    new_entry = models.PatientEntry(
        patient_identifier = patient.identifier,
        provider_identifier = current_user_id,
        info = params.info
    )

    db.add(new_entry)
    db.flush()
    db.commit()
    
    return {"status": "success", "message": "Entry added"}

@router.get("/api/get_entry_count")
def get_entry_count(
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Get entry count.")
    print("get count")

    current_user_obj = db.query(models.User).filter(
        (models.User.username == current_user)
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Internal error."
        )
    
    current_user_id = current_user_obj.id
    
    entry_count = db.query(models.PatientEntry).filter(
        (models.PatientEntry.provider_identifier == current_user_id)
    ).count()

    return {
        "count" : entry_count
    }

@router.get("/api/get_patients", response_model=List[PatientWithEntriesResponse])
def get_patients(
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Fetching patients and entries for current provider.")

    current_user_obj = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Internal error."
        )

    # Query patients belonging to this provider, eagerly loading their entries
    patients = (
        db.query(models.Patient)
        .join(models.PatientEntry)
        .filter(models.PatientEntry.provider_identifier == current_user_obj.id)
        .options(joinedload(models.Patient.entries))  # Fetch entries in the same query
        .distinct()
        .all()
    )

    return patients
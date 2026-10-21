from datetime import datetime
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from security import get_current_user
from config import logger
import models

router = APIRouter()

class CreateEvent(BaseModel):
    title: str
    start: datetime
    end: datetime

class UpdateEvent(BaseModel):
    id : int
    title: str | None = None
    start: datetime | None = None
    end: datetime | None = None

class EventResponse(BaseModel):
    id : int
    title: str
    start: datetime
    end: datetime
    
@router.post("/api/create_event", status_code=status.HTTP_201_CREATED)
def create_event(
    params: CreateEvent, 
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Create event.")

    current_user_obj = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Validate time interval
    if params.start > params.end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time interval."
        )

    new_event = models.Event(
        title=params.title,
        creator_id=current_user_obj.id,
        start=params.start,
        end=params.end
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return {"status": "success", "message": "Event added", "id": new_event.id}

@router.put("/api/update_event")
def update_event(
    params: UpdateEvent, 
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Update event.")

    current_user_obj = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    event_obj = db.query(models.Event).filter(
        models.Event.id == params.id
    ).first()

    if not event_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found."
        )

    # Optional: Verify the current user actually owns this event
    if event_obj.creator_id != current_user_obj.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this event."
        )

    # Determine final values
    if params.title is not None:
        title_final = params.title
    else:
        title_final = event_obj.title

    if params.start is not None:
        start_final = params.start
    else:
        start_final = event_obj.start

    if params.end is not None:
        end_final = params.end
    else:
        end_final = event_obj.end

    if start_final > end_final:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time interval."
        )

    # Mutate the tracked SQLAlchemy object directly
    event_obj.title = title_final
    event_obj.start = start_final
    event_obj.end = end_final

    # Save to database (db.add is NOT needed for existing session objects)
    db.commit()
    db.refresh(event_obj)
    
    return {"status": "success", "message": "Event updated"}


@router.delete("/api/delete_event")
def delete_event(
    id: int, 
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Update event.")

    current_user_obj = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    event_obj = db.query(models.Event).filter(
        models.Event.id == id
    ).first()

    if not event_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found."
        )

    # Optional: Verify the current user actually owns this event
    if event_obj.creator_id != current_user_obj.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this event."
        )

    db.delete(event_obj)

    db.commit()

    return {"status": "success", "message": "Event deleted"}

@router.get("/api/get_events", response_model=List[EventResponse])
def get_events(
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    logger.info("Get events.")

    current_user_obj = db.query(models.User).filter(
        models.User.username == current_user
    ).first()

    if not current_user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

        # Query patients belonging to this provider, eagerly loading their entries
    events = (
        db.query(models.Event)
        .filter(models.Event.creator_id == current_user_obj.id)
        .distinct()
        .all()
    )

    return events
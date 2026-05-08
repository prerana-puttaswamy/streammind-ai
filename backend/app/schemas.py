from pydantic import BaseModel
from datetime import datetime

class EventCreate(BaseModel):
    event_type: str
    status: str
    source: str
    message: str

class EventResponse(BaseModel):
    id: int
    event_type: str
    status: str
    source: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
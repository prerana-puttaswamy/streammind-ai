from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String)
    status = Column(String)
    source = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
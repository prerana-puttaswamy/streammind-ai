import json
import os
import redis

from .celery_worker import celery_app
from .database import SessionLocal
from .models import Event

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

@celery_app.task
def process_event(event_data):
    db = SessionLocal()

    try:
        db_event = Event(
            event_type=event_data["event_type"],
            status=event_data["status"],
            source=event_data["source"],
            message=event_data["message"]
        )

        db.add(db_event)
        db.commit()
        db.refresh(db_event)

        payload = {
            "id": db_event.id,
            "event_type": db_event.event_type,
            "status": db_event.status,
            "source": db_event.source,
            "message": db_event.message,
            "created_at": str(db_event.created_at)
        }

        redis_client = redis.Redis.from_url(REDIS_URL)
        redis_client.publish("events", json.dumps(payload))

        return "Event processed successfully"

    finally:
        db.close()
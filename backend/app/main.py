import asyncio
import json
import os
import redis.asyncio as redis

from .user_schemas import UserCreate, UserLogin
from .auth import hash_password, verify_password, create_access_token

from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from .models import Event
from .user_models import User
from .schemas import EventCreate, EventResponse
from .tasks import process_event
from .websocket_manager import manager

Base.metadata.create_all(bind=engine)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

app = FastAPI(
    title="StreamMind API",
    description="Event processing and anomaly detection backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
async def start_redis_listener():
    async def listen():
        redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("events")

        while True:
            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=1.0
            )

            if message and message["type"] == "message":
                data = json.loads(message["data"])
                await manager.broadcast(data)

            await asyncio.sleep(0.01)

    asyncio.create_task(listen())


@app.get("/")
def root():
    return {"message": "StreamMind API is running"}


@app.post("/events")
def create_event(event: EventCreate):
    process_event.delay(event.model_dump())
    return {"message": "Event sent to processing queue"}


@app.get("/events", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.created_at.desc()).all()


@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    events = db.query(Event).all()

    total_events = len(events)
    failed_events = len([event for event in events if event.status == "failed"])
    success_events = len([event for event in events if event.status == "success"])

    failure_rate = 0
    if total_events > 0:
        failure_rate = round((failed_events / total_events) * 100, 2)

    event_type_counts = {}

    for event in events:
        if event.event_type not in event_type_counts:
            event_type_counts[event.event_type] = 0
        event_type_counts[event.event_type] += 1

    anomaly_detected = failure_rate >= 30

    return {
        "total_events": total_events,
        "success_events": success_events,
        "failed_events": failed_events,
        "failure_rate": failure_rate,
        "anomaly_detected": anomaly_detected,
        "event_type_counts": event_type_counts
    }


@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {"error": "User already exists"}

    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        return {"error": "Invalid email or password"}

    if not verify_password(user.password, existing_user.hashed_password):
        return {"error": "Invalid email or password"}

    token = create_access_token({"sub": existing_user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
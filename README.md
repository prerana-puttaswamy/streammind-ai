# StreamMind AI — Real-Time Event Intelligence Platform

> Full-stack event-driven analytics platform with live dashboard, anomaly detection, and async processing  
> Built with FastAPI, Redis, Celery, Next.js, WebSockets, JWT, Docker

🔗 **[Live Demo](https://streammind-ai.vercel.app)**

---

## The Problem

Modern distributed systems generate thousands of events per minute — payments, API calls, user actions, failures. Without real-time visibility, teams can't detect anomalies until users complain. Polling-based dashboards are slow and waste resources. StreamMind solves this.

---

## What It Does

StreamMind AI is a full-stack real-time event monitoring platform that:

- Ingests events via REST API and processes them asynchronously using Celery workers
- Streams live updates to the dashboard via WebSockets — **no polling, ~80% lower UI latency**
- Detects anomalies automatically when failure rates exceed thresholds
- Visualizes event volume, success/failure rates, and alerts in real time
- Supports **100+ events/min** in local testing with horizontal scaling via additional workers
- Secured with JWT authentication and bcrypt password hashing

---

## Key Metrics

| Metric | Result |
|---|---|
| UI update latency reduction | ~80% vs polling |
| Throughput (local testing) | 100+ events/min |
| Services containerized | 4 (backend, frontend, worker, Redis) |
| Deployment | One command: `docker compose up --build` |

---

## Architecture

```
Client (Next.js)
      ↓  POST /events
FastAPI Backend
      ↓  queues task
Redis (message broker)
      ↓  picks up task
Celery Worker
      ↓  stores result + publishes to Redis channel
FastAPI WebSocket listener
      ↓  broadcasts to connected clients
Client dashboard updates instantly
```

---

## Features

**Async Event Processing**
- Celery workers decouple event ingestion from processing
- Redis Streams used as message broker
- Supports horizontal scaling by adding more workers

**Real-Time Dashboard**
- WebSocket connection replaces polling
- Live charts for event volume, success rate, failure rate
- Auto-updating without page refresh

**Anomaly Detection**
- Monitors failure rate in real time
- Triggers alert banner when error threshold exceeded
- Demonstrates production-grade observability patterns

**Authentication**
- JWT-based login and registration
- bcrypt password hashing
- Protected frontend routes with token validation

**One-Command Deployment**
- Fully Dockerized with Docker Compose
- Independent services: backend, frontend, Celery worker, Redis
- Reproducible across any environment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI, Python |
| Task Queue | Celery |
| Message Broker / Cache | Redis (Pub/Sub + Streams) |
| Real-Time | WebSockets |
| Database ORM | SQLAlchemy |
| Authentication | JWT (python-jose), bcrypt (passlib) |
| Frontend | Next.js (App Router), React, TypeScript |
| Charts | Recharts |
| Containerization | Docker, Docker Compose |

---

## Project Structure

```
streammind-ai/
├── backend/
│   ├── main.py              # FastAPI app + WebSocket endpoint
│   ├── worker.py            # Celery worker tasks
│   ├── models.py            # SQLAlchemy models
│   ├── auth.py              # JWT authentication
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Dashboard, charts, auth UI
│   └── package.json
├── docker-compose.yml       # Full stack orchestration
├── dashboard.png
├── login.png
└── api.png
```

---

## Running Locally

**Prerequisites:** Docker installed

```bash
# Clone the repo
git clone https://github.com/prerana-puttaswamy/streammind-ai.git
cd streammind-ai

# Start all services
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend Dashboard | http://localhost:3000 |
| Backend API Docs | http://localhost:8000/docs |

---

## API Reference

**Auth**
```
POST /register    — create account
POST /login       — get JWT token
```

**Events**
```
POST /events      — ingest a new event
GET  /events      — list all events
```

**Analytics**
```
GET /analytics    — event counts, failure rate
```

**WebSocket**
```
WS /ws/events     — real-time event stream
```

**Example event payload:**
```json
{
  "event_type": "payment",
  "status": "failed",
  "source": "checkout-service",
  "message": "payment timeout error"
}
```

---

## Screenshots

### Dashboard
![Dashboard](./dashboard.png)

### Login
![Login](./login.png)

### API Docs
![API](./api.png)

---

## Future Improvements

- Role-based access control
- Event filtering and search
- Kafka integration for higher throughput
- Prometheus + Grafana monitoring
- Cloud deployment (AWS ECS / GCP Cloud Run)

---

## Author

**Prerana Puttaswamy**  
MS Computer Science, California State University, Long Beach  
[GitHub](https://github.com/prerana-puttaswamy) | [LinkedIn](https://www.linkedin.com/in/prerana-puttaswamy-a07836224/) | [Portfolio](https://preranap.vercel.app)

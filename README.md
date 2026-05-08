# StreamMind AI

Real-time Event Intelligence Platform built with FastAPI, Redis, Celery, and Next.js.

---

## Features

- ⚡ Async event processing using Celery
- 📡 Real-time updates via WebSockets
- 📊 Analytics dashboard with charts
- 🚨 Anomaly detection (failure rate monitoring)
- 🔐 JWT authentication (login/register)
- 🐳 Fully Dockerized microservices architecture

---

## Architecture

Frontend (Next.js)  
⬇  
FastAPI Backend  
⬇  
Redis (Pub/Sub + Queue)  
⬇  
Celery Workers  

---

## Tech Stack

- FastAPI
- Redis
- Celery
- Next.js
- Docker
- Recharts
- JWT Auth

---

## Run Locally

```bash
docker compose up --build

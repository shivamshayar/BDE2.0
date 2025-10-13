# 🐳 Docker Quick Start Guide

## TL;DR

```bash
# Production
docker-compose up -d
docker-compose exec backend python -m api.seed

# Development  
docker-compose -f docker-compose.dev.yml up
```

Access: http://localhost:5000  
Login: `MACHINE-001` / `pass123`

---

## What's Included

✅ **PostgreSQL 15** - Persistent database with health checks  
✅ **FastAPI Backend** - Python API with hot reload (dev mode)  
✅ **React Frontend** - Vite dev server (dev) or Nginx (prod)  
✅ **JWT Authentication** - Secure machine login  
✅ **Volume Persistence** - Data survives container restarts

---

## Quick Commands

### Start Services
```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Initialize Database
```bash
# Seed test data
docker-compose exec backend python -m api.seed

# Access database
docker-compose exec postgres psql -U bde_user -d bde_tracking
```

### Stop Services
```bash
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## Environment Setup

### Production
1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and change:
   - `POSTGRES_PASSWORD`
   - `SECRET_KEY`

3. Start services:
   ```bash
   docker-compose up -d
   ```

### Development
```bash
# Automatic hot reload for backend and frontend
docker-compose -f docker-compose.dev.yml up
```

---

## Troubleshooting

### Backend won't connect to database
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres
```

### Port already in use
```bash
# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # Backend
  - "3000:5000"  # Frontend
```

### Clear everything and start fresh
```bash
docker-compose down -v --rmi all
docker-compose up -d --build
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Port 5000)           │
│   React + Vite (dev) or Nginx (prod)    │
└────────────────┬────────────────────────┘
                 │
                 ├─→ JWT Auth
                 │
┌────────────────▼────────────────────────┐
│           Backend (Port 8000)            │
│         FastAPI + Uvicorn                │
└────────────────┬────────────────────────┘
                 │
                 ├─→ SQLAlchemy ORM
                 │
┌────────────────▼────────────────────────┐
│        PostgreSQL (Port 5432)            │
│         Persistent Volume                │
└─────────────────────────────────────────┘
```

---

## Production Checklist

- [ ] Change `POSTGRES_PASSWORD` in `.env`
- [ ] Change `SECRET_KEY` in `.env` (min 32 chars)
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Enable log rotation
- [ ] Set up database backups
- [ ] Configure monitoring/alerts

---

📖 **Full Documentation**: [README.docker.md](README.docker.md)

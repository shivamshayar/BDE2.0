# Docker Deployment Guide

This guide explains how to run the BDE Work Tracking System using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:5000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Development Mode

```bash
# Use development compose file with hot reload
docker-compose -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend-dev

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Services

### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: bde_tracking
- **User**: bde_user
- **Password**: bde_password (⚠️ Change in production!)

### Backend (FastAPI)
- **Port**: 8000
- **Health Check**: http://localhost:8000/api/health
- **API Docs**: http://localhost:8000/docs

### Frontend (React/Vite)
- **Port**: 5000
- **Production**: Nginx serving built static files
- **Development**: Vite dev server with HMR

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (⚠️ Change in production!)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: 30)

### Frontend
- `VITE_API_URL`: Backend API URL (development only)

## Database Setup

### Initialize Database

```bash
# Access the backend container
docker-compose exec backend bash

# Run database seeding
python -m api.seed

# Exit container
exit
```

### Connect to Database

```bash
# Using docker-compose
docker-compose exec postgres psql -U bde_user -d bde_tracking

# Using local psql client
psql -h localhost -U bde_user -d bde_tracking
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild Services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

### Database Management
```bash
# Backup database
docker-compose exec postgres pg_dump -U bde_user bde_tracking > backup.sql

# Restore database
docker-compose exec -T postgres psql -U bde_user -d bde_tracking < backup.sql

# Reset database
docker-compose down -v
docker-compose up -d
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker-compose down -v --rmi all --remove-orphans
```

## Production Deployment

### Security Checklist

1. **Change default passwords**:
   ```yaml
   # In docker-compose.yml
   environment:
     POSTGRES_PASSWORD: <strong-random-password>
     SECRET_KEY: <strong-random-secret>
   ```

2. **Use environment file**:
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with production values
   nano .env
   ```

3. **Enable SSL/TLS**:
   - Configure nginx with SSL certificates
   - Update `nginx.conf` for HTTPS

4. **Set up reverse proxy**:
   - Use nginx or Traefik as reverse proxy
   - Configure domain names and SSL

5. **Enable logging**:
   - Configure log rotation
   - Set up centralized logging

### Performance Tuning

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    
  postgres:
    environment:
      POSTGRES_SHARED_BUFFERS: 256MB
      POSTGRES_MAX_CONNECTIONS: 100
```

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect bde-backend | jq '.[0].State.Health'
docker inspect bde-postgres | jq '.[0].State.Health'
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait for postgres health check
# 2. Port 8000 already in use - change port mapping
# 3. Missing dependencies - rebuild image
```

### Frontend won't build
```bash
# Check build logs
docker-compose logs frontend

# Rebuild with no cache
docker-compose build --no-cache frontend
```

### Database connection issues
```bash
# Test database connection
docker-compose exec backend python -c "
from api.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT 1'))
    print('Database connected!')
"
```

### Container keeps restarting
```bash
# View last 100 lines of logs
docker-compose logs --tail=100 <service-name>

# Check exit code
docker inspect <container-id> | jq '.[0].State'
```

## File Structure

```
.
├── Dockerfile.backend          # Backend production image
├── Dockerfile.frontend         # Frontend production image
├── docker-compose.yml          # Production compose file
├── docker-compose.dev.yml      # Development compose file
├── nginx.conf                  # Nginx configuration
├── requirements-docker.txt     # Python dependencies
├── .dockerignore              # Docker ignore file
└── README.docker.md           # This file
```

## Test Credentials

After seeding the database:

- **Machine ID**: MACHINE-001
- **Password**: pass123

## Support

For issues and questions:
1. Check logs: `docker-compose logs -f`
2. Review health checks: `docker-compose ps`
3. Verify environment variables
4. Check firewall/port availability

# Docker Deployment Guide

This guide explains how to deploy the BDE System using Docker and Docker Compose outside of Replit.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose V2 or later
- At least 2GB of available RAM
- 5GB of available disk space

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. Set Environment Variables (Optional)

Create a `.env` file in the project root:

```bash
# Database credentials
POSTGRES_PASSWORD=your_secure_database_password

# Application secrets
SESSION_SECRET=your_random_secret_key_here
```

**Important**: In production, always use strong, randomly generated passwords and secrets.

### 3. Build and Start Services

```bash
# Build and start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### 4. Initialize the Database

The database schema will be automatically created when the application starts. To manually push the schema:

```bash
# Run database migrations inside the container
docker-compose exec app npm run db:push
```

### 5. Access the Application

- **Application URL**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **Default Login**: Machine ID: `BDE-1`, Password: `1234`

## Service Details

### Application (app)
- **Port**: 5000
- **Container Name**: bde_app
- **Health Check**: HTTP request to root path every 30s

### PostgreSQL (postgres)
- **Port**: 5432 (exposed for debugging)
- **Container Name**: bde_postgres
- **Database**: bde_system
- **User**: bde_user
- **Health Check**: pg_isready every 10s

## Docker Compose Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Application
```bash
docker-compose up -d --build app
```

### View Running Containers
```bash
docker-compose ps
```

### Execute Commands in Container
```bash
# Shell access to app container
docker-compose exec app sh

# Shell access to database
docker-compose exec postgres psql -U bde_user -d bde_system
```

## Data Persistence

### Volumes
- **postgres_data**: Stores PostgreSQL database files
- **app_storage**: Stores uploaded user images and files

To backup volumes:
```bash
# Backup database
docker-compose exec postgres pg_dump -U bde_user bde_system > backup.sql

# Restore database
docker-compose exec -T postgres psql -U bde_user -d bde_system < backup.sql
```

## Production Deployment Recommendations

### 1. Use Strong Credentials
Never use default passwords in production. Generate secure credentials:

```bash
# Generate a random password
openssl rand -base64 32

# Generate a session secret
openssl rand -hex 32
```

### 2. Configure Reverse Proxy
Use Nginx or Traefik as a reverse proxy with SSL/TLS:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Regular Backups
Set up automated backups for:
- PostgreSQL database
- Uploaded files in app_storage volume

### 4. Monitoring
Consider adding monitoring services:
- **Logs**: Centralized logging with ELK stack or Grafana Loki
- **Metrics**: Prometheus + Grafana
- **Uptime**: Uptime Kuma or similar

### 5. Security Best Practices
- Keep Docker images updated
- Use non-root users in containers
- Implement rate limiting
- Enable firewall rules
- Regular security audits

## Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Port 5000 already in use
# 2. Database connection failed
# 3. Missing environment variables
```

### Database connection errors
```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Image upload not working
```bash
# Check storage permissions
docker-compose exec app ls -la /app/storage

# Recreate storage volume
docker-compose down
docker volume rm bde_app_storage
docker-compose up -d
```

### Reset Everything
```bash
# Stop all services
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## Scaling Considerations

For high-traffic deployments:

1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)
2. **Storage**: Use S3-compatible object storage (AWS S3, MinIO, DigitalOcean Spaces)
3. **Application**: Scale horizontally with multiple app containers behind a load balancer
4. **Caching**: Add Redis for session storage and caching

Example with multiple app instances:
```yaml
services:
  app:
    # ... existing config ...
    deploy:
      replicas: 3
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | `bde_secure_password_123` |
| `SESSION_SECRET` | Express session secret | `change_this_to_a_random_secret_key` |
| `DATABASE_URL` | Full database connection string | Auto-generated |
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Application port | `5000` |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Public file storage path | `/app/storage/public` |
| `PRIVATE_OBJECT_DIR` | Private file storage path | `/app/storage/private` |

## Support

For issues and questions:
1. Check application logs: `docker-compose logs -f app`
2. Check database logs: `docker-compose logs -f postgres`
3. Review this documentation
4. Check Docker and Docker Compose versions

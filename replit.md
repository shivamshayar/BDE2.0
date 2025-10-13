# BDE Work Tracking System

## Overview
A comprehensive Business Data Entry (BDE) system for tracking factory worker performance. Built with **FastAPI backend** and **React/TypeScript frontend**.

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database (Neon)
- **SQLAlchemy** - ORM
- **JWT Authentication** - Machine login with password hashing (bcrypt)
- **Uvicorn** - ASGI server

### Frontend  
- **React + TypeScript**
- **Wouter** - Routing
- **TanStack Query** - Data fetching
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling

## Architecture

### Database Models
1. **BDE Machines** - Machine login credentials
2. **Users** - Factory workers
3. **Part Numbers** - Product part catalog
4. **Order Numbers** - Production orders
5. **Performance IDs** - Performance metrics
6. **Work Sessions** - Time tracking records

### API Endpoints

#### Authentication
- `POST /api/machines/login` - Machine login (returns JWT)

#### BDE Machines
- `GET /api/machines` - List all machines
- `POST /api/machines` - Create new machine
- `PUT /api/machines/{id}/reset-password` - Reset password
- `DELETE /api/machines/{id}` - Delete machine

#### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Master Data (Part Numbers, Order Numbers, Performance IDs)
- `GET /api/{resource}` - List all
- `POST /api/{resource}` - Create new
- `DELETE /api/{resource}/{id}` - Delete

#### Work Sessions
- `POST /api/work-sessions` - Create work session
- `GET /api/work-sessions` - List all sessions
- `GET /api/work-sessions/user/{id}` - Get user's sessions

## Running the Application

### Option 1: Docker Compose (Recommended for Production)

**Production:**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Seed database
docker-compose exec backend python -m api.seed
```

**Development with hot reload:**
```bash
# Start with development configuration
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

📖 **Full Docker documentation**: See [README.docker.md](README.docker.md)

### Option 2: Manual Start (Development)

**Using startup script:**
```bash
./start_all.sh
```

**Manual start:**

Terminal 1 - FastAPI Backend (port 8000):
```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Terminal 2 - Frontend (port 5000):
```bash
npm run dev
```

### Access the Application
- Frontend: http://localhost:5000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Test Credentials

**Machine Login:**
- Machine ID: `MACHINE-001`
- Password: `pass123`

## Features

### 1. Machine Login
- Secure authentication with JWT
- Single active session enforcement per machine
- Password hashing with bcrypt

### 2. User Selection
- Visual user cards with avatars
- Role-based display
- Search functionality

### 3. Work Tracking
- Multiple concurrent user sessions per machine
- Real-time timer with start/stop
- Flexible input modes:
  - Dropdown selection
  - Manual typing
  - USB barcode scanning (scans as keyboard input)
- Part number, order number, and performance ID tracking

### 4. Admin Dashboard
- **BDE Machines Tab**: Create/reset passwords, manage machines
- **Users Tab**: CRUD operations for workers
- **Part Numbers Tab**: Manage part catalog
- **Order Numbers Tab**: Manage production orders
- **Performance IDs Tab**: Manage performance metrics

## Design System

### Colors
- **Primary**: Vibrant blue (210° hue)
- **Success/Active**: Professional green
- **Accent**: Purple highlights
- **Sidebar**: Deep navy gradient

### Visual Features
- Gradient backgrounds
- Multi-layer shadows
- Glass morphism effects
- Smooth animations
- Professional Material Design approach

### Interactive Elements
- Hover lift effects
- Animated timer glow when running
- Gradient borders on active states
- Responsive touch-optimized controls

## Development Notes

### Database Seeding
```bash
python -m api.seed
```

This creates:
- 3 BDE machines (MACHINE-001, 002, 003)
- 4 test users
- Sample part numbers, orders, and performance IDs

### API Client
The frontend uses a centralized API client (`client/src/lib/api.ts`) that:
- Handles JWT authentication
- Manages localStorage for tokens
- Provides type-safe API methods
- Handles errors consistently

### Frontend Structure
```
client/src/
├── components/       # Reusable UI components
├── pages/           # Route pages
├── lib/             # Utilities (API client, etc.)
└── hooks/           # Custom React hooks
```

### Backend Structure
```
api/
├── main.py          # FastAPI app & routes
├── models.py        # SQLAlchemy models
├── schemas.py       # Pydantic schemas
├── database.py      # DB connection
├── auth.py          # JWT & password hashing
├── dependencies.py  # Auth dependencies
└── seed.py          # Database seeding
```

## Docker Setup

### Files
```
├── Dockerfile.backend       # FastAPI production image
├── Dockerfile.frontend      # React/Vite production image
├── docker-compose.yml       # Production orchestration
├── docker-compose.dev.yml   # Development with hot reload
├── nginx.conf              # Nginx config for frontend
├── requirements-docker.txt  # Python dependencies
├── .dockerignore           # Docker ignore patterns
├── .env.example            # Environment template
└── README.docker.md        # Docker documentation
```

### Services
- **PostgreSQL**: postgres:15-alpine on port 5432
- **Backend**: FastAPI with uvicorn on port 8000
- **Frontend**: Nginx (prod) or Vite dev server (dev) on port 5000

## Recent Changes

**2024-10-13**: FastAPI backend implementation & security hardening
- Created complete REST API with all CRUD endpoints
- Implemented JWT authentication for machine login
- **Security Fixes Applied**:
  - Added JWT authentication enforcement to ALL protected routes
  - Created `get_current_machine` dependency for route protection  
  - Fixed work session creation to inject machine_id from authenticated token
  - Implemented frontend auth token persistence and rehydration
- Set up PostgreSQL database with SQLAlchemy
- Created API client with Bearer token support
- Connected admin dashboard to fetch real data from API
- Enhanced UI design with gradients and animations

## Next Steps

1. ✅ Backend API fully functional
2. ✅ Frontend connected to API
3. 🔄 Complete work tracking integration
4. 🔄 Add data validation and error handling
5. 🔄 Implement session management
6. 🔄 Add reporting/analytics features

## Security Implementation

### Authentication Flow
1. **Machine Login**: POST to `/api/machines/login` with machine_id and password
2. **Token Storage**: JWT token stored in localStorage via apiClient
3. **Auto-load**: Tokens automatically rehydrated on app startup
4. **Protected Routes**: All CRUD endpoints require valid Bearer token
5. **Work Sessions**: Machine ID automatically injected from authenticated token

### Protected Endpoints
All endpoints except `/api/machines/login` and `/api/health` require JWT authentication:
- BDE Machine management
- User CRUD operations
- Master data (part/order/performance)
- Work session tracking

## Known Issues

- FastAPI server needs to be started manually in separate terminal (see Running the Application section above)
- No role-based authorization yet (all authenticated machines have full access)

## User Preferences

- **Backend**: Python/FastAPI (not Node.js/Express)
- **Database**: PostgreSQL
- **Design**: Modern, professional, touch-optimized for factory floor
- **Input Methods**: Support dropdown, manual entry, AND barcode scanning

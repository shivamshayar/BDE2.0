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

### Start Both Servers

**Option 1: Using startup script**
```bash
./start_all.sh
```

**Option 2: Manual start**

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
└── seed.py          # Database seeding
```

## Recent Changes

**2024-10-13**: FastAPI backend implementation
- Created complete REST API with all CRUD endpoints
- Implemented JWT authentication for machine login
- Set up PostgreSQL database with SQLAlchemy
- Created API client for frontend integration
- Updated admin dashboard to fetch real data
- Enhanced UI design with gradients and animations

## Next Steps

1. ✅ Backend API fully functional
2. ✅ Frontend connected to API
3. 🔄 Complete work tracking integration
4. 🔄 Add data validation and error handling
5. 🔄 Implement session management
6. 🔄 Add reporting/analytics features

## Known Issues

- FastAPI server needs to be started manually (backgrounding issue with uvicorn)
- Frontend currently points to localhost:8000 (no environment variable configuration)

## User Preferences

- **Backend**: Python/FastAPI (not Node.js/Express)
- **Database**: PostgreSQL
- **Design**: Modern, professional, touch-optimized for factory floor
- **Input Methods**: Support dropdown, manual entry, AND barcode scanning

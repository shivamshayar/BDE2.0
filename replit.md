# BDE System - Factory Worker Performance Tracking

## Project Overview
A comprehensive Business Data Entry (BDE) system for tracking factory worker performance on production machines. Features machine-based authentication, multi-user session management, timer-based work tracking, and admin dashboard for managing master data.

## Recent Changes (October 22, 2025)
- ✅ **Barcode generation** - Part Numbers, Order Numbers, and Performance IDs now display barcodes in admin panel
- ✅ **PDF barcode downloads** - Download all barcodes for any master data category as PDF
- ✅ **USB barcode scanner support** - Tracker page input fields work seamlessly with USB barcode scanners
- ✅ Duration editing capability added to work history - users can now edit the time/duration of submitted entries
- ✅ Work history grid expanded to 4 columns (Part Number, Order Number, Performance ID, Duration)
- ✅ Duration field shows readable format (hours, minutes, seconds) but accepts input as total seconds
- ✅ Modified entries tracked with `isModified` flag and displayed with "Modified" badge
- ✅ Automatic database setup on server startup

## ✅ Automatic Database Setup

The application now **automatically creates all database tables** when it starts up! You don't need to manually run migrations or push schema.

### How It Works
- On server startup, the app checks if database tables exist
- If tables don't exist, they are created automatically using `CREATE TABLE IF NOT EXISTS`
- This works in both development and production environments
- Safe to run multiple times - won't overwrite existing data

### What This Means
- ✅ Published URL will work immediately (no manual database setup needed)
- ✅ Fresh database installations work automatically
- ✅ No need to run `npm run db:push` manually
- ✅ Production and development databases initialize the same way

## Architecture

### Technology Stack
- **Frontend**: React + Vite, Wouter (routing), TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Storage**: Replit Object Storage for user profile images

### Database Schema
Located in `shared/schema.ts`:
- `bdeMachines` - BDE machine credentials (Machine ID + password)
- `users` - Factory workers with profile images
- `partNumbers` - Master data for part numbers
- `orderNumbers` - Master data for order numbers  
- `performanceIds` - Master data for performance IDs
- `workSessions` - Active work sessions (timer running)
- `workLogs` - Completed work entries with duration and metadata
  - Includes `isModified` flag for tracking edited entries

### Key Features

#### Machine Login
- Machine-based authentication (not user-based)
- Machine ID + password required
- Default test credentials: **BDE-1** / **1234**

#### Multi-User Sessions
- Multiple users can work on same machine simultaneously
- Compact sidebar shows active users with avatars
- Users remain in sidebar after stopping/submitting (don't auto-remove)
- New users added to TOP of sidebar list
- Long-press (800ms) on user avatar when timer NOT running to remove with confirmation

#### Timer-Based Work Tracking
- Each user has independent timer
- Must enter: Part Number, Order Number, Performance ID
- Flexible input methods:
  - Dropdown selection from master data
  - Manual typing
  - USB barcode scanning (any input method works)
- Duration tracked in seconds, displayed as HH:MM:SS

#### Work History
- Users can view their last 10 submitted work entries
- Edit capability for all fields: Part Number, Order Number, Performance ID, Duration
- Modified entries display "Modified" badge
- Duration shown in readable format (e.g., "2h 15m 30s") but edited as total seconds
- Error state shows retry button (distinct from empty state)

#### User Profile Images
- Upload profile images via object storage
- Images stored in `.private` directory
- Displayed in sidebar and throughout UI
- Uses Shadcn Avatar component with fallback initials

#### Admin Dashboard
- Manage BDE machines (add/edit/delete)
- Manage master data:
  - Users
  - Part Numbers (with barcode display and PDF download)
  - Order Numbers (with barcode display and PDF download)
  - Performance IDs (with barcode display and PDF download)
- **Barcode Generation**: Each master data item automatically generates a Code128 barcode
- **PDF Export**: Download all barcodes for any category as a single PDF file
- Touch-optimized for factory floor
- Mutations use explicit try-catch with error re-throw for proper error handling

#### Barcode Support
- **Visual Barcodes**: Admin panel displays Code128 barcodes for all master data
- **PDF Downloads**: Export all barcodes for Part Numbers, Order Numbers, or Performance IDs as PDF
- **USB Scanner Support**: Tracker page inputs work seamlessly with USB barcode scanners
  - Barcode scanners act as keyboard input devices
  - Click input field or dropdown button to enter/select values
  - Automatic text selection on focus - scanning replaces existing value (no append)
  - German keyboard normalization (ß → -, etc.) for international compatibility
  - Works with Part Number, Order Number, and Performance ID fields
  - No special configuration needed - plug and play!

### Design System

#### Color Scheme
- **Primary Color**: Green `#15803d` (forest green)
- **Accent Colors**: Golden/amber accents
- Fully supports light and dark modes
- Professional, modern factory-appropriate design

#### Touch Optimization
- Minimum 44x44px touch targets for factory floor use
- Large, easy-to-tap buttons
- Responsive design for tablet/touchscreen devices

#### Design Guidelines
See `design_guidelines.md` for comprehensive design system documentation.

## User Preferences

### Critical Requirements
- ❌ NO role field in user management (removed from entire system)
- ✅ PostgreSQL database (not MariaDB)
- ✅ Green primary color #15803d
- ✅ Users stay in sidebar after stop/submit
- ✅ Long-press to remove users (800ms, confirmation dialog)
- ✅ New users at TOP of sidebar
- ✅ Flexible input: dropdown + manual typing + barcode scanning

### Technical Preferences
- Touch-optimized for factory floor
- Professional, modern UI
- Clear error states with retry buttons
- Compact sidebar for multi-user display

## File Structure

### Important Files
- `shared/schema.ts` - Database schema and types
- `server/storage.ts` - Storage interface (uses PostgreSQL, not in-memory)
- `server/routes.ts` - API endpoints
- `client/src/pages/WorkTrackerPage.tsx` - Main work tracking interface
- `client/src/components/CompactWorkTracker.tsx` - Multi-user sidebar component
- `client/src/components/WorkHistoryDialog.tsx` - Work history with editing
- `client/src/components/AdminDashboard.tsx` - Admin management interface
- `client/src/index.css` - Color scheme and design tokens

## Running the Project

### Development
```bash
npm run dev
```
Runs on http://localhost:5000

### Production Build
```bash
npm run build
npm run start
```

### Database Commands
```bash
npm run db:push  # Push schema to database
```

## Deployment

### External Deployment (Docker)
See `DOCKER_DEPLOYMENT.md` for detailed instructions on deploying outside Replit.

**Note**: Docker files are for external deployment only. Replit uses Nix, not Docker.

### Replit Publishing
1. Click "Deploy" button in Replit
2. **IMPORTANT**: Push database schema to production (see Production Database Setup above)
3. Your app will be live at `your-repl-name.replit.app`

## Test Credentials

### Machine Login
- **Machine ID**: BDE-1
- **Password**: 1234

## Known Issues

### Production Database
- ⚠️ Published URL requires database schema to be pushed to production database
- See "Production Database Setup" section above for fix

## Future Enhancements
- Consider adding export/reporting features
- Consider adding shift-based analytics
- Consider adding mobile app for workers

# BDE Work Tracking System - Design Guidelines

## Design Approach
**System Selection**: Material Design with industrial/manufacturing optimization
**Rationale**: Function-focused productivity application requiring clarity, efficiency, and reliability in factory floor environments. Material Design provides robust component patterns for data-heavy interfaces while maintaining professional aesthetics.

## Core Design Principles
- **Clarity Over Aesthetics**: Every element serves a functional purpose
- **Immediate Recognition**: Users should instantly understand their current state and available actions
- **Touch-Optimized**: Large, accessible controls suitable for factory floor use
- **Status Transparency**: Clear visual feedback for system state (logged in, timer running, data submitted)

## Color Palette

**Light Mode (Primary Interface)**:
- Primary: 210 100% 45% (Professional blue - trust and reliability)
- Primary Hover: 210 100% 38%
- Secondary: 150 65% 45% (Success green for start/active states)
- Error/Stop: 0 85% 55% (Clear red for stop actions)
- Surface: 0 0% 98% (Clean white background)
- Surface Elevated: 0 0% 100%
- Border: 220 15% 85%
- Text Primary: 220 20% 15%
- Text Secondary: 220 15% 45%

**Dark Mode**:
- Primary: 210 95% 55%
- Background: 220 25% 8%
- Surface: 220 20% 12%
- Surface Elevated: 220 18% 15%
- Border: 220 15% 25%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%

**Status Colors**:
- Timer Active: 150 70% 45% (Green glow effect)
- Timer Stopped: 220 15% 55% (Neutral gray)
- Session Active: 200 90% 50% (Blue indicator)
- Warning: 38 92% 50% (Amber for alerts)

## Typography

**Font Families**:
- Primary: 'Inter' (Google Fonts) - excellent readability, professional
- Monospace: 'JetBrains Mono' - for timer display and IDs

**Type Scale**:
- Headings: 32px/36px (Page titles), 24px/32px (Section headers), 18px/24px (Card headers)
- Body: 16px/24px (Primary text), 14px/20px (Secondary text)
- Timer Display: 48px/56px Bold (Monospace)
- Labels: 12px/16px Medium (Form labels, uppercase tracking-wide)
- Buttons: 16px/24px Semibold

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16 for consistency
- Card padding: p-8
- Section spacing: space-y-8
- Form field gaps: space-y-4
- Button spacing: px-8 py-3
- Container max-width: max-w-7xl

**Grid System**:
- Login Page: Single centered card (max-w-md)
- User Selection: 3-column grid on desktop (lg:grid-cols-3), 2-col tablet (md:grid-cols-2), single mobile
- Work Tracking: Split layout - Left side (user info + timer), Right side (data entry form)
- Dashboard: Responsive table layout with action columns

## Component Library

**Navigation & Headers**:
- Top bar: Fixed header with machine ID, current user indicator, logout button
- Breadcrumb navigation showing current step (Login → Select User → Work Tracking)
- Session status badge (green dot + "Active Session" text)

**Cards & Containers**:
- Elevated cards with subtle shadow (shadow-md)
- Border radius: rounded-xl for cards, rounded-lg for buttons
- User selection cards: Image + name + role badge, hover state with scale transform
- Work tracking card: Large, prominent with status indicator

**Forms & Inputs**:
- Large input fields: h-12 with clear labels above
- Dropdown selects with search capability
- Auto-complete for part numbers and order numbers
- Clear visual states: default, focused (ring-2 ring-primary), error (ring-red-500), disabled
- Required field indicators (red asterisk)

**Buttons**:
- Primary actions: bg-primary text-white, large size (h-12 px-8)
- Start button: bg-green-600 with pulse animation when active
- Stop button: bg-red-600, requires confirmation modal
- Secondary actions: variant outline with border
- Icon buttons for table actions: h-10 w-10 rounded-lg

**Timer Component**:
- Large monospace display (48px font)
- Format: HH:MM:SS
- Start state: Green background glow (bg-green-500/10)
- Running state: Pulsing green border animation
- Stopped state: Gray with no animation

**Tables & Lists**:
- Striped rows for readability (even:bg-gray-50)
- Sticky header row
- Action column always visible on right
- Pagination controls at bottom
- Search and filter bar above table

**Modals & Overlays**:
- Confirmation dialogs for critical actions (Stop timer, Logout)
- Full-screen loading overlay during data submission
- Success/error toast notifications (top-right position)

## Page-Specific Layouts

**Page 1 - Machine Login**:
- Centered card on full-height page
- Company logo/title at top
- Machine ID and password fields stacked vertically
- Large login button
- Session conflict warning if machine already logged in elsewhere

**Page 2 - User Selection**:
- Search bar at top (sticky)
- Grid of user cards with photos (150x150px rounded-full)
- Card hover effect: subtle lift + shadow increase
- User count indicator ("12 users available")
- Selected state: blue border + checkmark overlay

**Page 3 - Work Tracking**:
- Two-column split (40/60)
- Left: User profile card with large photo (200x200px), name, role, session info
- Right: Form area with dropdowns and timer
- Timer: Prominent top section with large display
- Data entry: Stacked form fields below timer
- Action buttons: Full-width Start/Stop at bottom

**Admin Dashboard**:
- Tabbed interface (Users | Orders | Performance IDs | Part Numbers)
- Table view with CRUD actions
- Add new button (top-right, always visible)
- Inline editing for quick updates
- Bulk actions toolbar when items selected

## Animations
**Essential Only**:
- Timer pulse: Subtle 2s infinite animation when running
- Button interactions: Quick 150ms scale on click
- Toast notifications: Slide-in from right (300ms)
- Card hover: 200ms transform and shadow transition
- NO page transitions or decorative animations

## Images
**User Photos**: 
- Circular avatars throughout (rounded-full)
- Selection page: 150x150px
- Work tracking: 200x200px
- Table rows: 40x40px
- Fallback: Colored initials on gradient background

**No Hero Images**: This is a utility application, not marketing

## Accessibility & Usability
- Touch targets minimum 44x44px
- High contrast ratios (WCAG AA minimum)
- Keyboard navigation for all interactions
- Focus indicators visible on all interactive elements
- Loading states for all async operations
- Error messages clear and actionable
- Success confirmation for all data submissions
# Planning Guide

A personal work calendar to track 12-hour work shifts (7:00 AM - 7:00 PM or 7:00 PM - 7:00 AM) and rest days with a minimalist Stardew Valley-inspired aesthetic.

**Experience Qualities**:
1. **Cozy** - The interface should feel warm and inviting, like opening a personal journal in a peaceful farming village
2. **Intuitive** - Shift tracking should be effortless with clear visual indicators for day/night shifts and rest days
3. **Nostalgic** - Pixel-art inspired elements and earthy tones evoke the charm of classic farming games

**Complexity Level**: Light Application (multiple features with basic state)
This is a shift calendar with basic CRUD operations for managing work schedules. Users can add, view, and delete shifts across months, with persistent storage for their schedule data.

## Essential Features

**Monthly Calendar View**
- Functionality: Display a full month calendar grid showing work shifts and rest days
- Purpose: Provides an at-a-glance overview of the entire work schedule
- Trigger: App loads with current month displayed
- Progression: App opens → Current month calendar appears → Days show shift indicators (morning sun, night moon, or rest)
- Success criteria: Calendar displays correctly across all months, shifts are clearly visible

**Add Shift**
- Functionality: Select a day and assign a shift type (morning 7AM-7PM, night 7PM-7AM, or rest day)
- Purpose: Allows users to build and maintain their work schedule
- Trigger: User taps/clicks on any calendar day
- Progression: Click day → Dialog opens with shift options → Select shift type → Confirm → Calendar updates with visual indicator
- Success criteria: Shifts persist between sessions, visual feedback is immediate

**Edit/Delete Shift**
- Functionality: Modify or remove existing shifts
- Purpose: Enables schedule adjustments and corrections
- Trigger: User clicks on a day that already has a shift assigned
- Progression: Click assigned day → Dialog shows current shift → Choose new shift or delete → Confirm → Calendar updates
- Success criteria: Changes save correctly, deleted shifts clear visual indicators

**Month Navigation**
- Functionality: Browse between months to view past and plan future schedules
- Purpose: Allows long-term schedule planning and review
- Trigger: User clicks previous/next month arrows
- Progression: Click arrow → Calendar transitions to adjacent month → Persisted shifts display correctly
- Success criteria: Smooth navigation, data persists across all months

## Edge Case Handling

- **Empty Calendar State**: First-time users see a clean calendar with a welcoming message explaining how to add their first shift
- **Month Boundaries**: Ensures correct day counts for all months including February leap years
- **Touch vs Click**: Responsive interactions work equally well on mobile touch and desktop mouse
- **Long-term Data**: Calendar handles years of historical data without performance degradation

## Design Direction

The design should evoke the cozy, handcrafted feeling of Stardew Valley - warm earth tones, pixel-inspired typography, subtle textures reminiscent of paper or wood, and gentle shadows that create depth without harsh contrasts. The interface should feel like a cherished planner kept on a farmhouse desk.

## Color Selection

A warm, earthy palette inspired by Stardew Valley's natural and rustic aesthetic.

- **Primary Color**: `oklch(0.55 0.08 75)` - Warm olive green representing growth and nature, used for primary actions and headers
- **Secondary Colors**: 
  - Morning shift: `oklch(0.75 0.15 85)` - Golden yellow like sunrise
  - Night shift: `oklch(0.45 0.12 250)` - Deep twilight blue
  - Rest day: `oklch(0.65 0.08 140)` - Soft meadow green
- **Accent Color**: `oklch(0.58 0.18 35)` - Warm amber orange for CTAs and selected states
- **Foreground/Background Pairings**:
  - Background `oklch(0.96 0.01 85)` (Warm cream): Foreground `oklch(0.25 0.02 70)` (Dark brown) - Ratio 13.2:1 ✓
  - Primary `oklch(0.55 0.08 75)`: White text `oklch(1 0 0)` - Ratio 5.1:1 ✓
  - Accent `oklch(0.58 0.18 35)`: White text `oklch(1 0 0)` - Ratio 4.8:1 ✓

## Font Selection

Typography should feel handcrafted yet legible, with a slight geometric quality reminiscent of pixel fonts but readable at all sizes.

- **Typographic Hierarchy**:
  - H1 (Month/Year Header): Bungee Regular/32px/tight tracking - Bold, display-worthy
  - H2 (Day Numbers): Rubik Medium/18px/normal - Clear, friendly numerals
  - Body (Labels, UI): Rubik Regular/14px/relaxed - Comfortable reading
  - Small (Shift Times): Rubik Light/12px/normal - Subtle details

## Animations

Animations should feel organic and gentle, like pages turning in a book or leaves rustling. Use subtle spring physics for dialog appearances, smooth fades for calendar transitions, and gentle scale transforms when selecting days. Avoid jarring movements - everything should feel calm and intentional, reinforcing the peaceful farming aesthetic.

## Component Selection

- **Components**:
  - Calendar grid: Custom component built with CSS Grid for responsive day layout
  - Dialog: Shadcn Dialog for shift selection with custom styling
  - Button: Shadcn Button with rounded corners and soft shadows
  - Card: Shadcn Card for calendar container with textured background
  - Badge: Custom badges for shift type indicators within calendar cells
  
- **Customizations**:
  - Calendar cells with hover states showing subtle lift effect
  - Custom shift badges with icons (sun for morning, moon for night, leaf for rest)
  - Textured background using CSS patterns to simulate paper/wood grain
  - Rounded corners throughout (--radius: 0.75rem) for softer feel
  
- **States**:
  - Calendar days: default (empty), hover (subtle scale), has-shift (shows badge), selected (amber glow)
  - Buttons: default (soft shadow), hover (slight lift), active (pressed inset)
  - Dialog: entrance with gentle spring animation, backdrop with warm overlay
  
- **Icon Selection**:
  - Sun (morning shift), Moon (night shift), Leaf/FlowerLotus (rest day)
  - CaretLeft/CaretRight for month navigation
  - Plus for adding quick shifts
  - X for closing dialogs
  
- **Spacing**:
  - Container padding: p-6 (24px)
  - Calendar cell gaps: gap-2 (8px)
  - Dialog content: p-6 with space-y-4 for vertical rhythm
  - Button padding: px-6 py-3 for comfortable touch targets
  
- **Mobile**:
  - Calendar switches from 7-column to optimized grid maintaining readability
  - Dialog slides from bottom on mobile (drawer-style) vs center on desktop
  - Touch targets minimum 44px for easy tapping
  - Month navigation buttons remain large and accessible
  - Font sizes remain consistent (already optimized for mobile)

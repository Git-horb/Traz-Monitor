# Dx Monitor - Design Guidelines

## Design Approach
**Selected Approach:** Design System with inspiration from modern developer tools (Vercel Dashboard, Linear, Datadog)  
**Rationale:** Utility-focused monitoring tool requiring clarity, data density, and efficient information display. The interface prioritizes quick status recognition and metric comprehension over decorative elements.

**Key Principles:**
- Data clarity over decoration
- Instant status recognition through strategic visual indicators
- Mobile-first information hierarchy
- Professional, technical aesthetic that builds trust

---

## Typography System

**Font Stack:** Inter (Google Fonts) for all text
- **Display/Headers:** 600 weight, tracking-tight
- **Body Text:** 400-500 weight, tracking-normal
- **Metrics/Numbers:** 600-700 weight, tabular-nums for alignment
- **Labels/Captions:** 500 weight, text-sm, text-xs for metadata

**Size Hierarchy:**
- Hero/Page titles: text-3xl to text-4xl
- Section headers: text-xl to text-2xl
- Card titles: text-lg
- Body/metrics: text-base
- Labels: text-sm
- Timestamps/metadata: text-xs

---

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4, p-6
- Card spacing: p-6 (desktop), p-4 (mobile)
- Section gaps: gap-6, gap-8
- Page margins: px-4 (mobile), px-6 (tablet), px-8 (desktop)

**Grid Structure:**
- Mobile (base): Single column, full-width cards with gap-4
- Tablet (md:): 2-column grid for monitor cards (grid-cols-2 gap-6)
- Desktop (lg:): 3-column grid for monitor cards (grid-cols-3 gap-6)
- Max container width: max-w-7xl mx-auto

**Dashboard Layout:**
- Top navigation: Sticky header with logo, "Add Monitor" CTA
- Stats overview: Single row of 3-4 metric cards (total monitors, uptime %, avg response time)
- Monitor grid: Responsive card grid as primary content
- Each card: Self-contained monitor display with status, metrics, history

---

## Component Library

### Status Indicators
**Primary Status Badge:**
- "UP": Green pill badge with subtle green background glow
- "DOWN": Red pill badge with subtle red background alert
- "CHECKING": Amber pill with pulsing animation
- Badge style: Rounded-full px-3 py-1, font-semibold text-xs uppercase tracking-wide

**Visual Feedback:**
- Cards with "UP" status: Subtle green left border (border-l-4)
- Cards with "DOWN" status: Subtle red left border, slightly elevated shadow
- Status changes: Brief fade transition (transition-all duration-300)

### Monitor Cards
**Card Structure:**
- White/surface background with border and shadow (shadow-sm hover:shadow-md transition)
- Rounded corners: rounded-lg
- Internal padding: p-6
- Card header: Site name (text-lg font-semibold) + status badge
- URL display: text-sm truncate with subtle styling
- Metrics row: Grid display showing response time, uptime %, last checked
- Mini sparkline: 24-hour status history as small bar/dot visualization
- Quick actions: Edit interval, view details (icon buttons, size-8)

### Metrics Display
**Metric Format:**
- Large number: text-2xl to text-3xl font-bold tabular-nums
- Label below: text-xs uppercase tracking-wide opacity-60
- Response time: "247ms" with green/amber/red color coding based on speed
- Uptime percentage: "99.2%" with progress bar visualization underneath

**Stats Cards (Overview):**
- Glass-morphism effect: backdrop-blur with subtle background
- Icon + large metric number + label
- Organized in horizontal row on desktop, stacked on mobile

### Forms & Inputs
**Add Monitor Modal/Page:**
- Input fields: border rounded-lg px-4 py-3, focus:ring-2 focus:border-transparent
- Labels: font-medium text-sm mb-2
- URL input: Full width with placeholder "https://example.com"
- Name input: Optional display name for the monitor
- Interval selector: Radio buttons or segmented control (1min, 5min, 15min, 30min, 1hr)
- Primary CTA: Full-width button "Start Monitoring" with emphasis

### Status History Visualization
**24-Hour Timeline:**
- Horizontal bar of small squares/dots (w-2 h-8 each)
- Green = up ping, red = down ping, gray = no data
- Tooltip on hover showing exact time and response
- Mobile: Scrollable horizontal timeline
- Desktop: Full width display with 24 segments

### Navigation
**Top Bar:**
- Fixed/sticky positioning (sticky top-0 z-50)
- Logo/brand: "Dx Monitor" with distinctive icon
- Right-aligned: "Add Monitor" button (prominent, contrasting)
- Mobile: Hamburger menu if needed (though single-page dashboard may not need it)

### Empty States
**No Monitors Added:**
- Centered content: Large icon, "No monitors yet" heading
- Descriptive text: "Add your first website to start monitoring uptime"
- Primary CTA: "Add Monitor" button
- Illustration/icon suggesting monitoring/watching

---

## Responsive Behavior

**Mobile (base - 640px):**
- Single column layout for all cards
- Stats overview: Stacked vertically with gap-4
- Monitor cards: Full width
- Status history: Horizontal scroll
- Bottom fixed "Add Monitor" FAB (floating action button)

**Tablet (md: 768px):**
- 2-column monitor grid
- Stats overview: 2x2 grid or horizontal row
- Larger touch targets maintained

**Desktop (lg: 1024px+):**
- 3-column monitor grid
- Stats overview: Horizontal row of 4 cards
- Hover states fully activated
- Expanded metric details visible without interaction

---

## Animation Strategy

**Minimal, Purposeful Animations:**
- Status changes: Fade transition (300ms)
- Card hover: Subtle lift with shadow increase (transition-shadow duration-200)
- "Checking" status: Gentle pulse animation on badge
- New monitor added: Slide-in from top
- Page transitions: None (instant, data-focused)

**No Complex Animations:** Avoid scroll-triggered effects, parallax, or decorative motion

---

## Images

**No large hero image needed** - This is a utility dashboard, not a marketing page. The interface begins immediately with the functional dashboard.

**Icon Usage:**
- Use Heroicons (via CDN) for all interface icons
- Status icons: CheckCircle (up), XCircle (down), Clock (checking)
- Action icons: Plus, Pencil, Trash, ChartBar
- Consistent sizing: w-5 h-5 for inline icons, w-6 h-6 for buttons

---

## Accessibility

- Status conveyed through BOTH color and text/icons (not color alone)
- Focus states: Visible ring on all interactive elements
- Aria labels on icon-only buttons
- Semantic HTML: Use appropriate heading hierarchy
- Keyboard navigation: Tab through cards and actions logically
- Status changes announced to screen readers via aria-live regions
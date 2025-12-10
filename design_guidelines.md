# Dx Monitor - Design Guidelines (Cyberpunk Edition)

## Design Approach
**Selected Approach:** Custom cyberpunk design system inspired by command center interfaces (Tron, Blade Runner UI, sci-fi dashboards)  
**Rationale:** Transform utility monitoring into an immersive, futuristic experience where data visualization feels alive. Dark theme reduces eye strain during extended monitoring sessions while neon accents provide instant status recognition.

**Key Principles:**
- Glowing status indicators as primary visual language
- Layered depth through transparency and blur effects
- Kinetic energy through subtle animations and pulses
- Terminal/command center aesthetic for technical credibility

---

## Color System

**Base Palette:**
- Background: Near-black (#0a0a0f)
- Surface/Cards: Dark slate (#12121a) with 60% opacity, backdrop-blur
- Borders: Cyan glow (#00d9ff) / Purple glow (#b24bf3)
- Text primary: Cool white (#e8e8f0)
- Text secondary: Muted cyan (#7dd3fc, 70% opacity)

**Status Colors with Glow:**
- UP: Neon cyan (#00d9ff) - glowing green-cyan gradient
- DOWN: Alert red (#ff0055) with magenta undertones
- CHECKING: Electric purple (#b24bf3) with pulsing animation
- DEGRADED: Amber (#ffaa00) neon warning

**Accent Usage:**
- Primary actions: Cyan gradient (cyan-500 to blue-500)
- Hover states: Purple glow expansion
- Focus rings: Cyan with outer purple shadow (double-ring effect)

---

## Typography

**Font:** Inter (Google Fonts)
- Headers: 700 weight, uppercase tracking-widest for sci-fi feel
- Metrics: 600-700 weight, tabular-nums, slight letter-spacing
- Body: 400-500 weight
- Monospace override for timestamps: Use JetBrains Mono for terminal aesthetic

**Hierarchy:**
- Dashboard title: text-2xl uppercase tracking-widest font-bold
- Section headers: text-lg uppercase tracking-wide
- Monitor names: text-xl font-semibold
- Metrics: text-4xl font-bold tabular-nums (glowing text effect)
- Labels: text-xs uppercase tracking-wider opacity-70

**Text Effects:**
- Critical metrics: Subtle text-shadow glow matching status color
- Headers: Faint cyan text glow on hover

---

## Layout System

**Spacing Primitives:** Tailwind units 2, 4, 6, 8, 12, 16, 24
- Card padding: p-6 (desktop), p-4 (mobile)
- Section gaps: gap-8
- Page margins: px-4 (mobile), px-8 (desktop)
- Glow padding: Additional p-1 for border glow containers

**Grid Structure:**
- Mobile: Single column (gap-4)
- Tablet (md:): 2-column grid (grid-cols-2 gap-6)
- Desktop (lg:): 3-column grid (grid-cols-3 gap-8)
- Max width: max-w-7xl mx-auto

**Dashboard Layout:**
- Fixed header: Logo + "Add Monitor" glowing button (sticky top-0)
- Stats grid: 4 metric cards in horizontal row, each with animated border glow
- Monitor grid: Card grid with staggered fade-in on load
- Floating particles background: Subtle animated dots/grid lines

---

## Component Library

### Status Cards (Monitor Cards)
- Glass-morphism base: backdrop-blur-xl bg-slate-900/60
- Animated border: Gradient border (2px) matching status - rotates on hover
- Glow effect: Box-shadow with status color, intensifies on hover
- Internal structure: Name + URL + status badge + metrics row + sparkline
- Hover state: Card lifts (translateY -4px), glow expands 8px, shadow intensifies
- UP cards: Cyan left border-l-2 with soft cyan glow
- DOWN cards: Red border-l-2 with pulsing red glow, elevated urgency

### Status Indicators
- Badge style: Rounded-full px-4 py-1.5 font-bold text-xs uppercase
- UP: Cyan background with inner glow, animated shimmer effect
- DOWN: Red with urgent pulse (scale 1.0 to 1.05, 1s infinite)
- CHECKING: Purple with rotating border gradient animation
- Include icon: Small dot or symbol before text

### Stats Overview Cards
- Translucent card: backdrop-blur-lg bg-gradient-to-br from-cyan-900/20 to-purple-900/20
- Large metric number: text-5xl font-bold with colored text-shadow glow
- Icon: w-12 h-12 with cyan/purple gradient fill
- Animated counter: Numbers tick up on load
- Border: 1px gradient border (cyan to purple) with subtle rotation animation
- Hover: Glow intensity increases, scale 1.02

### Status History Visualization
- Horizontal timeline of small squares (w-3 h-10 rounded-sm)
- UP: Cyan glowing squares
- DOWN: Red glowing squares
- CHECKING: Purple with pulse
- Gap between squares: gap-1
- Container: Scrollable horizontal with fade edges
- Tooltip: Floating dark panel with cyan border showing timestamp

### Forms & Modals
- Modal overlay: Backdrop-blur-2xl with dark overlay (bg-black/80)
- Form container: Glass card with cyan border glow
- Input fields: Dark with cyan border, focus state adds purple glow
- Labels: Cyan text, uppercase, text-xs tracking-wide
- Primary button: Cyan-to-blue gradient, glowing shadow, hover brightens
- Secondary: Outlined cyan with hover fill

### Navigation
- Top bar: Fixed backdrop-blur-xl bg-black/40 with cyan bottom border (1px)
- Logo: "DX MONITOR" uppercase with slight cyan glow
- Add Monitor button: Gradient button with floating animation
- Mobile: Bottom fixed FAB with pulsing glow ring

### Empty States
- Centered: Large cyberpunk icon (glowing outline)
- Heading: "NO ACTIVE MONITORS" uppercase tracking-widest
- Subtitle: Cyan colored suggestion text
- CTA: Large glowing gradient button
- Background: Animated grid pattern with fading lines

---

## Animation Strategy

**Purposeful Motion:**
- Card entrance: Staggered fade-in with slide-up (50ms delay each)
- Status pulse: CHECKING and DOWN states pulse continuously (2s ease-in-out)
- Border rotation: Gradient borders slowly rotate (20s infinite)
- Hover lifts: Cards translateY -4px (200ms ease-out)
- Glow expansion: Box-shadow grows on hover (300ms)
- Metric counters: Animate numbers on mount
- Background particles: Slow floating motion

**No Overload:** Keep animations smooth (60fps), use GPU-accelerated properties (transform, opacity), disable on reduced-motion preference

---

## Images & Icons

**No Large Hero Image** - Dashboard begins immediately with functional interface

**Icons:** Heroicons via CDN
- Status: CheckCircle, XCircle, Clock (all with glow filter)
- Actions: Plus, Pencil, Trash, ChartBar
- Sizes: w-5 h-5 inline, w-6 h-6 buttons
- Style: Stroke-width 2, colored with status colors, add drop-shadow glow

**Background Elements:**
- Subtle grid pattern overlay (CSS gradient)
- Floating particle effect (small cyan/purple dots drifting)
- Scanline animation (optional faint horizontal lines)

---

## Accessibility

- Status uses color + text + icons (triple reinforcement)
- Glow effects enhance visibility, don't replace semantic meaning
- Focus states: Cyan ring with purple outer glow (high contrast)
- ARIA labels on all icon buttons
- Reduced motion: Remove animations, keep glows static
- Contrast: Ensure text meets WCAG AA on dark backgrounds
- Keyboard nav: Visible focus, logical tab order
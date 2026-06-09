# SPEC.md - SaaS Company Website

## 1. Concept & Vision

A premium SaaS company website that exudes professionalism and trustworthiness. The site feels like a gateway to cutting-edge technology solutions—sleek, confident, and effortlessly navigable. Every interaction reinforces the message: "This is a company that delivers excellence."

## 2. Design Language

### Aesthetic Direction
Modern corporate minimalism with subtle tech accents. Think Stripe meets Notion—clean geometry, generous whitespace, and purposeful color usage.

### Color Palette
- **Primary:** `#6366F1` (Indigo - trust & innovation)
- **Secondary:** `#0F172A` (Slate 900 - authority)
- **Accent:** `#22D3EE` (Cyan - energy & clarity)
- **Background:** `#FFFFFF` (White - clean)
- **Surface:** `#F8FAFC` (Slate 50 - subtle depth)
- **Text Primary:** `#1E293B` (Slate 800)
- **Text Secondary:** `#64748B` (Slate 500)

### Typography
- **Headings:** Inter (700, 600) - modern, geometric, professional
- **Body:** Inter (400, 500) - excellent readability
- **Accent/Labels:** Inter (500) - uppercase tracking for labels

### Spatial System
- Base unit: 8px
- Section padding: 96px vertical (desktop), 64px (tablet), 48px (mobile)
- Component spacing: 24px, 32px, 48px
- Max content width: 1200px

### Motion Philosophy
- Subtle fade-up animations on scroll (opacity 0→1, translateY 20px→0, 500ms ease-out)
- Hover transitions: 200ms ease for buttons, 150ms for links
- Staggered reveals: 100ms delay between elements
- No jarring or playful animations—everything feels measured and intentional

### Visual Assets
- Icons: Lucide icons (outlined style, 24px)
- Decorative: Subtle gradient overlays, geometric shapes as accents
- Images: Abstract tech imagery, team photos with consistent styling

## 3. Layout & Structure

### Navigation
- Fixed top navbar with blur backdrop
- Logo left, nav links center, CTA button right
- Mobile: Hamburger menu with slide-in panel

### Page Sections (Single Page Application feel)
1. **Hero** - Bold headline, subtext, dual CTAs, floating abstract graphic
2. **Features** - 3-column grid showcasing key capabilities
3. **Use Cases** - Icon-driven cards for industry applications (About section)
4. **Samples** - Portfolio/previous work showcase
5. **About/Company** - Mission, values, team highlights
6. **Contact/CTA** - Final conversion section
7. **Footer** - Links, social, legal

### Responsive Strategy
- Desktop: Full layouts, multi-column grids
- Tablet (768px): 2-column grids, adjusted spacing
- Mobile (480px): Single column, stacked elements, touch-friendly targets

## 4. Features & Interactions

### Navigation
- Smooth scroll to sections on nav click
- Active section highlighting in nav
- Mobile menu: slide from right, overlay background

### Hero Section
- Animated gradient background (subtle)
- Primary CTA: Filled button with hover scale (1.02) + shadow lift
- Secondary CTA: Outlined button

### Feature Cards
- Hover: Subtle lift (translateY -4px) + shadow increase
- Icon animates on hover (slight scale)

### Use Cases Grid (About Section)
- Cards with icon, title, description
- Hover: Border color change, background tint

### Samples Section
- Portfolio cards with hover overlay showing project details
- Filterable display (static for MVP)

### Contact Form
- Input focus: Border color change to primary
- Submit: Loading state with spinner
- Success/Error feedback messages

### Scroll Animations
- Elements fade in when entering viewport
- Staggered timing for grouped elements

## 5. Component Inventory

### Navbar
- States: Default (transparent bg), Scrolled (white bg + shadow), Mobile (collapsed/expanded)

### Button - Primary
- Default: Indigo bg, white text, rounded-lg
- Hover: Darker bg, slight scale, shadow
- Active: Even darker, pressed feel
- Disabled: Gray bg, reduced opacity
- Loading: Spinner + "Processing..."

### Button - Secondary
- Default: White bg, indigo border, indigo text
- Hover: Light indigo bg tint
- Active: Darker tint

### Feature Card
- Default: White bg, subtle border, rounded-xl
- Hover: Shadow-lg, slight lift

### Use Case Card
- Default: Surface bg, colored icon
- Hover: Border highlight, bg shift

### Portfolio Card
- Default: Image with rounded corners
- Hover: Overlay with title + description

### Form Input
- Default: White bg, slate border
- Focus: Primary border, subtle glow
- Error: Red border, error message below
- Success: Green checkmark

### Footer
- Multi-column layout
- Social icons with hover color change

## 6. Technical Approach

### Backend
- **Framework:** Flask (Python)
- **Purpose:** Serve static frontend + handle contact form API

### Frontend
- **Structure:** HTML5 semantic markup
- **Styling:** Custom CSS (no framework dependencies shown in UI)
- **Interactivity:** Vanilla JavaScript
- **Fonts:** Google Fonts (Inter)
- **Icons:** Lucide (CDN)

### API Endpoints
- `POST /api/contact` - Handle contact form submission
  - Request: `{ name, email, message }`
  - Response: `{ success: true, message: "..." }`

### File Structure
```
/home/user/
├── app.py              # Flask backend
├── templates/
│   └── index.html      # Main website page
├── static/
│   ├── css/
│   │   └── style.css   # Custom styles
│   └── js/
│       └── main.js     # Interactivity
├── SPEC.md
└── requirements.txt
```

### Deployment Ready
- Configurable for production WSGI server
- Environment variables for sensitive settings
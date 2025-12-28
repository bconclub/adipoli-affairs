# Adipoli Affairs - Build Truth & Project Structure

## Project Overview

**Adipoli Affairs** is a Next.js-based restaurant website showcasing authentic Kerala cuisine. The project is a modern, full-stack web application built with React 19, Next.js 16, and TypeScript, featuring a shopping cart system, responsive design, and optimized performance.

---

## Tech Stack

### Core Framework
- **Next.js**: `16.0.10` (App Router)
- **React**: `19.2.1`
- **React DOM**: `19.2.1`
- **TypeScript**: `^5`

### Key Dependencies
- **framer-motion**: `^12.23.26` - Animation library
- **lucide-react**: `^0.562.0` - Icon library
- **clsx**: `^2.1.1` - Conditional className utility
- **tailwind-merge**: `^3.4.0` - Merge Tailwind CSS classes
- **browser-image-compression**: `^2.0.2` - Client-side image compression
- **react-easy-crop**: `^5.5.6` - Image cropping component

### Development Dependencies
- **ESLint**: `^9` with `eslint-config-next`
- **@types/node**: `^20`
- **@types/react**: `^19`
- **@types/react-dom**: `^19`

### Fonts
- **Outfit** (Google Fonts) - Primary font family with weights: 300, 400, 500, 600, 700, 800

---

## Project Structure

```
Adipoli Affairs/
├── app/                          # Next.js App Router directory
│   ├── about/                   # About page route
│   │   └── page.tsx
│   ├── admin/                   # Admin page route
│   │   └── page.tsx
│   ├── catering/                # Catering page route
│   │   └── page.tsx
│   ├── contact/                 # Contact page route
│   │   └── page.tsx
│   ├── featured/                # Featured dishes page
│   │   ├── Featured.module.css
│   │   └── page.tsx
│   ├── menu/                    # Menu page route
│   │   └── page.tsx
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   ├── page.module.css          # Home page styles
│   └── page.tsx                 # Home page (landing)
│
├── components/                   # React components
│   ├── Cart.module.css
│   ├── Cart.tsx                 # Shopping cart component (sidebar on desktop, full-screen on mobile)
│   ├── FloatingCartButton.tsx   # Mobile floating cart button
│   ├── FloatingCartButton.module.css
│   ├── Footer.module.css
│   ├── Footer.tsx               # Footer component
│   ├── ImageCropper.tsx         # Image cropping component (16:9 aspect ratio)
│   ├── Navbar.module.css
│   ├── Navbar.tsx               # Navigation bar component
│   ├── Toast.tsx                # Toast notification component
│   └── Toast.module.css
│
├── contexts/                     # React Context providers
│   └── CartContext.tsx          # Shopping cart state management
│
├── data/                         # Data files
│   └── menu.ts                  # Menu data
│
├── lib/                          # Utility libraries
│   ├── imageCompression.ts      # Image compression utilities
│   ├── imageCrop.ts              # Image cropping utilities
│   ├── menuData.ts              # Menu data utilities
│   └── utils.ts                 # General utilities
│
├── public/                       # Static assets
│   ├── .htaccess                # Apache configuration for static export
│   ├── Adipoli icon.png         # Site favicon
│   ├── Adipoli Logo V1.png      # Main logo
│   ├── Adpilo Kitchen.mp4       # Hero section video (loops continuously)
│   ├── Heritage.webp            # Our Heritage section image
│   └── images/                  # Image assets (organized by category)
│       ├── beef.png
│       ├── biryani.png
│       ├── chicken.png
│       ├── hero.png
│       ├── soups/               # Category-specific images
│       ├── starters/
│       ├── combo-specials/
│       └── [other categories]/
│
├── .github/                     # GitHub configuration
│   ├── workflows/
│   │   └── deploy.yml           # GitHub Actions FTP deployment workflow
│   └── DEPLOYMENT.md            # Deployment documentation
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration (static export)
├── next-env.d.ts                # Next.js TypeScript declarations
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Lock file
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project README
```

---

## Build Configuration

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2017
- **Module**: ESNext
- **Module Resolution**: Bundler
- **JSX**: React JSX
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` → `./*`
- **Incremental Compilation**: Enabled

### Next.js Configuration (`next.config.ts`)

**Static Export Configuration:**
```typescript
{
  output: 'export',              // Static site generation
  images: {
    unoptimized: true           // Required for static export
  }
}
```

**Key Points:**
- Static export enabled for shared hosting deployment
- Images are unoptimized (handled client-side)
- No server-side features (API routes removed)
- Build output: `out/` directory

### ESLint Configuration (`eslint.config.mjs`)

- Uses Next.js ESLint configs:
  - `eslint-config-next/core-web-vitals`
  - `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

---

## Build Scripts

Available npm scripts (from `package.json`):

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build (static export to ./out/)
npm start        # Start production server (not used for static export)
npm run lint     # Run ESLint
```

**Build Output:**
- Static files are generated in `./out/` directory
- All pages are pre-rendered as static HTML
- No server required - can be deployed to any static hosting

---

## Application Architecture

### Routing Structure (App Router)

- `/` - Home page with local video hero, featured dishes, "Our Heritage" section with parallax, and about snippet
- `/about` - About page with proper padding and left-aligned content
- `/menu` - Full menu page with image carousels and restaurant-style layout
- `/featured` - Featured dishes page
- `/catering` - Catering services page (removed "Sample Menus & Packages" section)
- `/contact` - Contact page with proper padding and left-aligned content
- `/admin` - Admin page with simplified featured items management, search, and preview cards

### State Management

**Cart Context** (`contexts/CartContext.tsx`):
- Global shopping cart state using React Context API
- Functions:
  - `addItem()` - Add item to cart
  - `removeItem()` - Remove item from cart
  - `updateQuantity()` - Update item quantity
  - `clearCart()` - Clear all items
  - `getTotal()` - Calculate total price
  - `getItemCount()` - Get total item count
  - `openCart()` / `closeCart()` - Control cart visibility

### Component Architecture

1. **Layout** (`app/layout.tsx`):
   - Root HTML structure
   - Font loading (Outfit)
   - CartProvider wrapper
   - Navbar and Footer components
   - Metadata configuration

2. **Navbar** (`components/Navbar.tsx`):
   - Navigation menu
   - Cart icon with item count
   - Responsive design

3. **Footer** (`components/Footer.tsx`):
   - Footer information
   - Links and contact details

4. **Cart** (`components/Cart.tsx`):
   - Shopping cart component
   - **Desktop**: 450px sidebar that slides in from right
   - **Mobile**: Full-screen overlay
   - Item list with quantity controls
   - Checkout button always visible (no scrolling needed on mobile)
   - **WhatsApp checkout flow**: Modal form to collect customer name and phone number
   - Order details formatted and sent via WhatsApp API
   - Modal rendered via React Portal for proper viewport centering
   - Supports base64 images and public folder images

5. **FloatingCartButton** (`components/FloatingCartButton.tsx`):
   - Mobile-only floating button
   - Shows item count badge
   - Only visible when cart has items and cart modal is closed

6. **Toast** (`components/Toast.tsx`):
   - Slide-in notification from bottom
   - Shows "Item added to order!" message
   - Auto-dismisses after 3 seconds

7. **ImageCropper** (`components/ImageCropper.tsx`):
   - 16:9 aspect ratio cropping
   - Zoom and drag functionality
   - Used in admin panel for product images

8. **Admin Panel** (`app/admin/page.tsx`):
   - Menu items management with image editing
   - **Featured Items Management**:
     - Simplified list view with product name, edit button, and featured toggle
     - Search bar for easy product finding
     - Preview cards section showing featured items (50% smaller than menu cards)
     - Drag-and-drop reordering for featured items (visual feedback)
     - Close button on preview cards to remove from featured
   - Image cropping and compression for product images
   - Featured image section always visible in edit modal

---

## Key Features

### Implemented Features
1. ✅ Responsive design with mobile-first approach
2. ✅ Shopping cart functionality with state management
3. ✅ **Static export** for shared hosting deployment
4. ✅ **Image management system**:
   - Client-side compression (target: <200KB)
   - 16:9 aspect ratio cropping
   - Base64 storage in localStorage
   - Public folder fallback support
5. ✅ **Admin panel** for menu and featured items management
6. ✅ **Toast notifications** for cart actions
7. ✅ **Floating cart button** on mobile
8. ✅ **Category filtering** with multi-select modal
9. ✅ **Local video hero** with full video loop (`Adpilo Kitchen.mp4`)
10. ✅ **WhatsApp checkout flow** - Collects customer details and sends order via WhatsApp
11. ✅ **Parallax scroll effects** - "Our Heritage" section with ambient scroll animation
12. ✅ **Featured items management** - Simplified admin interface with search, preview cards, and drag-drop reordering
13. ✅ **Menu page redesign** - Image carousels and restaurant-style layout
14. ✅ **React Portals** - Modal rendering for checkout form (centered viewport positioning)
15. ✅ SEO optimization with metadata
16. ✅ Modern UI with glassmorphism effects
17. ✅ Font optimization with Next.js font loader
18. ✅ TypeScript for type safety
19. ✅ Client-side only (no server dependencies)

### Styling Approach
- CSS Modules for component-specific styles
- Global CSS (`globals.css`) for theme and utilities
- Inline styles for dynamic styling
- Custom CSS variables for theming

---

## Development Workflow

### Initial Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - Open [http://localhost:3000](http://localhost:3000)

### Building for Production

1. **Create Production Build**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm start
   ```

### Code Quality

- **Linting**: Run `npm run lint` before committing
- **Type Checking**: TypeScript compiler checks types during build
- **Code Formatting**: Configured via ESLint rules

---

## Environment & Deployment

### Development Environment
- **Node.js**: Compatible with Node 18+
- **Package Manager**: npm (via package-lock.json)
- **Port**: 3000 (default Next.js port)

### Production Considerations

1. **Build Output**: `out/` directory contains static HTML files
2. **Static Assets**: Served from `/public` directory (copied to `out/` during build)
3. **Image Handling**: 
   - Base64 images stored in localStorage (admin panel)
   - Public folder images for fallback
   - Images compressed client-side before storage
4. **No Server Required**: Fully static site, can be deployed to any static hosting

### Deployment Configuration

**GitHub Actions FTP Deployment** (`.github/workflows/deploy.yml`):
- **Server**: `82.180.152.35`
- **Server Directory**: `/home/u240474838/domains/adipoliaffairs.com/public_html/`
- **Local Directory**: `./out/` (static export output)
- **Clean Deployment**: `dangerous-clean-slate: true` (removes old files before upload)
- **Build Process**:
  1. Checkout code
  2. Install dependencies
  3. Build Next.js static export
  4. Verify `.htaccess` file
  5. Deploy to FTP server

**Apache Configuration** (`public/.htaccess`):
- Handles Next.js static export routes
- Serves `.html` files without extension (e.g., `/menu` → `/menu.html`)
- Custom error pages (403/404 redirect to `index.html`)
- Client-side routing fallback
- Compression and caching headers

### Deployment Platforms
- **Current**: Shared hosting via FTP (static export)
- **Alternative**: Any static hosting service (Vercel, Netlify, AWS S3, etc.)

---

## Metadata & SEO

### Site Metadata (from `app/layout.tsx`):
- **Title**: "Adipoli Affairs - Authentic Kerala Cuisine"
- **Description**: "Experience the true taste of Kerala in Christchurch. Authentic spices, fresh ingredients, and premium dining."
- **Favicon**: `/Adipoli icon.png`
- **Language**: English (`en`)

---

## Dependencies Breakdown

### Production Dependencies
- **next**: Core framework
- **react/react-dom**: UI library
- **framer-motion**: Smooth animations
- **lucide-react**: Icon set
- **clsx**: Conditional classes
- **tailwind-merge**: Tailwind class utilities

### Development Dependencies
- **typescript**: Type checking
- **eslint**: Code linting
- **@types/***: TypeScript type definitions

---

## Notes & Best Practices

1. **Component Organization**: Components are co-located with their CSS modules
2. **Type Safety**: All components use TypeScript for type checking
3. **Context Usage**: Cart state is managed via React Context for global access
4. **Image Handling**: 
   - Admin panel: Images compressed and cropped client-side, stored as base64 in localStorage
   - Menu/Cart: Supports both base64 and public folder images
   - Fallback to `/images/hero.png` if image not found
5. **Client Components**: All pages marked with `"use client"` (static export requirement)
6. **Path Aliases**: Use `@/` prefix for imports (configured in tsconfig.json)
7. **Static Export Limitations**:
   - No API routes (removed for static export)
   - No server-side features
   - All data stored in localStorage
   - Images stored as base64 strings
8. **Mobile Optimizations**:
   - Cart is full-screen on mobile with always-visible checkout button
   - Floating cart button appears when items are added
   - Category navigation extends edge-to-edge on mobile
   - Increased padding to prevent content from going under header

---

## Future Enhancements (Potential)

- Payment integration
- Order tracking system
- User authentication
- Admin dashboard functionality
- Menu management system
- Customer reviews/ratings
- Reservation system
- Email notifications

---

## Build Truth Summary

- **Framework**: Next.js 16.0.10 (App Router)
- **Build Type**: Static Export (`output: 'export'`)
- **Language**: TypeScript 5+
- **React Version**: 19.2.1
- **Package Manager**: npm
- **Build Tool**: Next.js built-in (Turbopack in dev)
- **Build Output**: `./out/` directory (static HTML files)
- **Styling**: CSS Modules + Global CSS
- **State Management**: React Context API + localStorage
- **Image Handling**: 
  - Client-side compression (browser-image-compression)
  - Client-side cropping (react-easy-crop, 16:9 aspect ratio)
  - Base64 storage in localStorage
  - Public folder fallback
  - Unoptimized images (required for static export)
- **Video Handling**:
  - Native HTML5 video element (replaced YouTube IFrame API)
  - Local MP4 file (`Adpilo Kitchen.mp4`) in public folder
  - Continuous loop playback
- **Font Loading**: Next.js Font Optimization (Google Fonts - Outfit)
- **Deployment**: GitHub Actions → FTP (shared hosting)
- **Server Requirements**: None (fully static)
- **Data Storage**: localStorage (menu items, featured items, cart)
- **Checkout Integration**: WhatsApp API for order submission
- **UI Components**: React Portals for modal rendering, Framer Motion for animations

## Key Architecture Decisions

1. **Static Export**: Chosen for shared hosting compatibility, no server required
2. **Base64 Images**: Stored in localStorage to avoid server-side file management
3. **Client-Side Image Processing**: Compression and cropping done in browser before storage
4. **Responsive Cart**: Different UX for desktop (sidebar) vs mobile (full-screen)
5. **Toast Notifications**: Non-intrusive bottom slide-in notifications
6. **Category Filtering**: Multi-select modal for flexible menu browsing
7. **Local Video**: Replaced YouTube IFrame API with native HTML5 video for better performance and control
8. **React Portals**: Used for checkout modal to ensure proper viewport centering and z-index layering
9. **WhatsApp Integration**: Client-side order formatting and WhatsApp API for seamless checkout flow
10. **Parallax Effects**: Scroll-based animations for enhanced visual experience

---

*Last Updated: January 2025 - Latest Build with Video Hero & WhatsApp Checkout*


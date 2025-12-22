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
│   ├── Cart.tsx                 # Shopping cart component
│   ├── Footer.module.css
│   ├── Footer.tsx               # Footer component
│   ├── Navbar.module.css
│   └── Navbar.tsx               # Navigation bar component
│
├── contexts/                     # React Context providers
│   └── CartContext.tsx          # Shopping cart state management
│
├── data/                         # Data files
│   └── menu.ts                  # Menu data
│
├── lib/                          # Utility libraries
│   └── menuData.ts              # Menu data utilities
│
├── public/                       # Static assets
│   ├── Adipoli icon.png         # Site favicon
│   ├── Adipoli Logo V1.png      # Main logo
│   └── images/                  # Image assets
│       ├── beef.png
│       ├── biryani.png
│       ├── chicken.png
│       └── hero.png
│
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
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

Default configuration with no custom options currently set. Configuration can be extended as needed for:
- Image optimization
- Environment variables
- Redirects/rewrites
- Headers/security

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
npm run build    # Create production build
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## Application Architecture

### Routing Structure (App Router)

- `/` - Home page with hero section, featured dishes, and about snippet
- `/about` - About page
- `/menu` - Full menu page
- `/featured` - Featured dishes page
- `/catering` - Catering services page
- `/contact` - Contact page
- `/admin` - Admin page

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
   - Shopping cart sidebar/overlay
   - Item list with quantity controls
   - Checkout functionality

---

## Key Features

### Implemented Features
1. ✅ Responsive design with mobile-first approach
2. ✅ Shopping cart functionality with state management
3. ✅ Image optimization using Next.js Image component
4. ✅ SEO optimization with metadata
5. ✅ Modern UI with glassmorphism effects
6. ✅ Font optimization with Next.js font loader
7. ✅ TypeScript for type safety
8. ✅ Client and Server Components separation

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

1. **Build Output**: `.next/` directory contains optimized build
2. **Static Assets**: Served from `/public` directory
3. **Image Optimization**: Next.js Image component handles optimization
4. **Environment Variables**: Can be configured via `.env.local` (not in repo)

### Recommended Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (for containerized deployment)

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
4. **Image Optimization**: All images use Next.js Image component for optimization
5. **Client Components**: Marked with `"use client"` directive when needed
6. **Path Aliases**: Use `@/` prefix for imports (configured in tsconfig.json)

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
- **Language**: TypeScript 5+
- **React Version**: 19.2.1
- **Package Manager**: npm
- **Build Tool**: Next.js built-in (Turbopack in dev)
- **Styling**: CSS Modules + Global CSS
- **State Management**: React Context API
- **Image Handling**: Next.js Image Optimization
- **Font Loading**: Next.js Font Optimization (Google Fonts)

---

*Last Updated: Generated from current project structure*


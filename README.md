# NOX — Industrial-Grade E-Commerce Platform

Full-stack, production-ready e-commerce platform built with Next.js 16 (App Router), TypeScript, Prisma ORM, and Tailwind CSS 4. Features a **33-model industrial database**, centralized **Media Library** (images, videos, GIFs, documents), full admin portal, guest cart, COD checkout, and comprehensive backend services.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 (Liquid Glass design system) |
| **UI** | 10 custom components (Button, Card, Input, Badge, Select, Toast, ErrorBoundary, etc.) |
| **State** | Zustand (guest cart persisted to LocalStorage) |
| **ORM** | Prisma 6.6.0 — 33 models with full indexing |
| **Database** | PostgreSQL 18 (primary) with Supabase failover |
| **Auth** | JWT + bcrypt (admin), client-side session |
| **Media** | Sharp (WebP, thumbnails, EXIF stripping); Upload API (planned) |
| **Containerization** | Docker + Docker Compose (Postgres + Redis + App) |

## Quick Start

```bash
npm install                          # Install dependencies
cp .env.example .env                 # Set DATABASE_URL, JWT_SECRET
npx prisma db push                   # Push 33-table schema to DB
npx prisma db seed                   # Seed with rich demo data
npm run dev                          # → http://localhost:3000
```

### Admin
- **Login**: `/admin/login` — `admin` / `admin123`
- **Dashboard**: Sales stats, order counts
- **Management**: Products, Categories, Orders, Pages, Banners, Appearance, Settings

## Database Architecture — 33 Models

### Core Commerce (12 models)
`Admin`, `AdminSession`, `Customer`, `CustomerGroup`, `Address`, `Category`, `CategoryMedia`, `Brand`, `Tag`, `ProductTag`

### Media Library (3 models)
- **`MediaFolder`** — Hierarchical folder organization (parent/children)
- **`Media`** — Centralized file storage: original name, mime_type, file_size, width/height, duration (video), blur_hash, 5 URL variants (original/thumb/small/medium/large), storage_provider (local/s3/supabase), status tracking (uploading/processing/ready/failed), ownership
- **`MediaUsage`** — Polymorphic usage tracking (product, category, banner, page, brand, admin avatar, customer avatar, site settings, redirects)

### Product System (9 models)
- **`Product`** — Full e-commerce: pricing, inventory, dimensions, tax_class, SEO, published_at, featured
- **`ProductMedia`** — Media gallery per product (supports variant-specific images/videos)
- **`ProductOption`** — Structured options: Size, Color, Material (type: select/radio/color_swatch/image_swatch)
- **`ProductOptionValue`** — Individual option values with optional swatch media
- **`ProductVariant`** — Variants with own SKU/price/stock, linked to option values via:
- **`VariantOptionValue`** — Junction: variant ↔ option values
- **`ProductAttribute`** — Informational attributes (Material, Care instructions, etc.)
- **`ProductRelation`** — Cross-sell, up-sell, related, accessory
- **`ProductPrice`** — Tiered & group pricing via PriceList

### Pricing & Tax (4 models)
- **`PriceList`** — Tier/customer-group/sale price lists with priority and scheduling
- **`ProductPrice`** — Per-product/variant pricing per price list
- **`TaxClass`** — Standard/Reduced/Zero tax classes
- **`TaxRate`** — Per-country/state/zip rates, compound support, shipping tax

### Shipping & Inventory (4 models)
- **`ShippingZone`** — Geographic zones with country/state/zip filters
- **`ShippingMethod`** — Flat/weight/price/free rates, carriers, estimated delivery
- **`Warehouse`** — Multi-warehouse management (primary flag)
- **`WarehouseStock`** — Per-warehouse stock with reserved count, min/max thresholds

### Orders & Payment (6 models)
- **`Order`** — Full lifecycle: addresses (snapshots), shipping zone/method, pricing (subtotal/discount/tax/total), payment tracking, currency, gift options
- **`OrderItem`** — Full snapshot pattern (name, SKU, variant, price, tax), variant support
- **`OrderStatusHistory`** — Complete audit trail of all status transitions
- **`PaymentTransaction`** — Gateway tracking (COD, Stripe, Razorpay), raw gateway response
- **`Refund`** — Refund tracking linked to payment transactions
- **`Return`**, **`ReturnItem`** — Full RMA with condition tracking

### Reviews (3 models)
- **`Review`** — Ratings 1-5, verified purchase, moderation workflow, helpful/not-helpful counts
- **`ReviewMedia`** — Customer-submitted media per review
- **`ReviewHelpful`** — Per-customer helpfulness votes

### Marketing (3 models)
- **`Coupon`** — Percentage/fixed/free-shipping, usage limits, min order, stackable, scheduled
- **`CouponProduct`** — Product restrictions
- **`CouponUsage`** — Redemption tracking per customer/order

### CMS & Content (5 models)
- **`Page`** — CMS pages with block editor JSON, SEO, publish scheduling
- **`Banner`** — Multi-position (hero/promo/sidebar/bottom), mobile-specific media, color overrides
- **`Redirect`** — SEO URL management (301/302), hit tracking
- **`SiteSetting`** — Key-value with type/group/is_private, supports image links
- **`ContactSubmission`** — Read tracking, reply timestamp

### Notifications & Audit (4 models)
- **`NotificationTemplate`** — Reusable templates with variable interpolation
- **`Notification`** — Email/SMS/Push/In-app, per-recipient tracking (sent/delivered/failed/read)
- **`ActivityLog`** — Comprehensive audit: action, resource, metadata (JSON), IP, user agent
- **`ApiKey`** — Integration keys with permissions, expiry, usage tracking

### Cart (1 model)
- **`CartItem`** — Guest (session_id) & logged-in (customer_id), variant-aware, price freeze

### Wishlist (1 model)
- **`WishlistItem`** — Per-customer product bookmarks with notes

### Other (1 model)
- **`InventoryLog`** — Full stock movement audit per warehouse (orders, returns, adjustments, transfers)

## Seed Data

`npx prisma db seed` creates a complete demo environment:
- **Admin**: `admin` / `admin123` (super_admin)
- **Tax**: Standard class with 20% rate, Warehouses (Main), Shipping zones + 3 methods
- **Categories**: Clothing, Accessories, Featured
- **Tags**: New Arrival, Sale, Limited Edition
- **Media**: 6 media entries with multiple URL variants (products + banners)
- **Products**: 3 products with media, options/variants, attributes, tags
- **Customer**: John Doe with address
- **Review**: 5-star verified on Classic Cotton Tee
- **Coupon**: `WELCOME10` (10% off, min $50)
- **Pages**: About Us, Shipping & Returns
- **Banners**: Hero + Promo with linked media
- **Orders**: Sample delivered order with status history
- **Notifications**: Order confirmation template
- **Settings**: Site name, colors, contact info, currency

## Media Library System

The `Media` model provides centralized, isolated file storage:

```
MediaFolder (tree)
  └── Media (files)
        ├── ProductMedia (gallery)
        ├── CategoryMedia (category images)
        ├── Banner (hero + mobile)
        ├── Brand (logo)
        ├── Page (og_image)
        ├── Admin/Customer (avatars)
        ├── SiteSetting (images)
        ├── ReviewMedia (review images)
        ├── Redirect (images)
        ├── ProductOptionValue (swatches)
        └── MediaUsage (polymorphic tracking)
```

Each media entry stores **5 URL variants**: original, thumbnail (100px), small (300px), medium (600px), large (1200px) — with blur_hash for lazy-load placeholders.

## Design System — Liquid Glass

- **Primary**: `#1C1917` | **Accent**: `#A16207` (gold) | **Background**: `#FAFAF9`
- **Typography**: Cormorant (headings) + Montserrat (body) via `next/font`
- **Glassmorphism**: `.feature-card`, `.glass-card-solid` — backdrop-blur, morph transitions (400ms)
- **Animations**: fadeIn, slideUp, glow keyframes

## Error Handling

- **Toast system**: `useToast()` → `toast({ type, title, message })` — success/error/info/warning, auto-dismiss
- **Admin CRUD**: Validation → toast, API failure → toast, connection error → toast, success → toast
- **Forms**: `noValidate` + custom validation, `border-destructive` on errors, field-level blur
- **Global**: ErrorBoundary (retry), `error.tsx`, `not-found.tsx`, DB try-catch fallbacks

## Key Architecture Patterns

1. **Guest cart**: Zustand → LocalStorage (`nox-cart`), hydrated via `CartProvider`
2. **Admin auth**: JWT → LocalStorage (`nox-admin` + `nox-admin-token`), lazy state in `admin-layout.tsx`
3. **Dynamic rendering**: `export const dynamic = "force-dynamic"` on all DB pages
4. **Decimal serialization**: `serializeProduct()` / `serializeOrder()` — Decimal → Number
5. **DB health check**: 30s interval → 3 failures → Supabase failover
6. **Media isolation**: All files reference `Media` model — no direct URL fields on business entities
7. **Snapshot pattern**: Orders/OrderItems freeze name, price, address at time of order

## API Routes Summary

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/products` | List/Create (with media, category) |
| GET/PUT/DELETE | `/api/products/[id]` | CRUD single product |
| GET/POST | `/api/categories` | List/Create categories |
| GET/POST | `/api/orders` | List/Create orders with items |
| GET/PUT | `/api/orders/[id]` | Get/Update order status |
| GET/POST | `/api/pages` | List/Create CMS pages |
| GET/POST | `/api/banners` | List/Create (with media) |
| POST | `/api/admin/auth` | Login (returns JWT) |
| PUT | `/api/admin/password` | Change password (JWT required) |
| GET/PUT | `/api/admin/settings` | Site settings |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/health` | DB health + failover status |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `SUPABASE_URL` | Supabase project URL (failover) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (failover) |

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build (0 errors) |
| `npm run lint` | ESLint check |
| `npx prisma db push` | Push schema |
| `npx prisma db seed` | Seed data |
| `npx prisma generate` | Regenerate client |
| `npx prisma studio` | DB browser |
| `npx tsc --noEmit` | Type check |
| `docker compose up -d` | Start Postgres + Redis + App |

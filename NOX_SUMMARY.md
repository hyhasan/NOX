# NOX — Quick Reference Summary

> **Purpose**: One-page overview for quick orientation.
> **Start here**: New agents should read this first, then `ARCHITECTURE.md`, then `AGENTS.md`.
> **Deep dive**: `NOX_REFERENCE.md` for technical patterns.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4 |
| UI | 10 custom components (Button, Card, Input, Badge, Select, Toast, ErrorBoundary, etc.) |
| Fonts | Cormorant (headings) + Montserrat (body) |
| State | Zustand (localStorage key `nox-cart`) |
| ORM | Prisma 6.6.0 — 33 models, full indexing |
| Database | PostgreSQL 18 + Supabase failover |
| Auth | JWT + bcrypt (admin only) |
| Media | Sharp (WebP, thumbnails); 5 URL variants per file |
| Infrastructure | Docker (Postgres + Redis + App) |

## Quick Start
```bash
npm install && npx prisma db push && npx prisma db seed && npm run dev
```
- Storefront: `http://localhost:3000`
- Admin: `/admin/login` — `admin` / `admin123`

## 33 Database Models by Domain

| Domain | Models |
|--------|--------|
| **Auth** | Admin, AdminSession, Customer, CustomerGroup |
| **Media Library** | MediaFolder, Media, MediaUsage |
| **Catalog** | Category, CategoryMedia, Brand, Tag, ProductTag |
| **Products** | Product, ProductMedia, ProductOption, ProductOptionValue, ProductVariant, VariantOptionValue, ProductAttribute, ProductRelation |
| **Pricing** | PriceList, ProductPrice, TaxClass, TaxRate |
| **Shipping** | ShippingZone, ShippingMethod, Warehouse, WarehouseStock |
| **Orders** | Order, OrderItem, OrderStatusHistory, PaymentTransaction, Refund |
| **Returns** | Return, ReturnItem |
| **Reviews** | Review, ReviewMedia, ReviewHelpful |
| **Marketing** | Coupon, CouponProduct, CouponUsage |
| **Content** | Page, Banner, Redirect, SiteSetting |
| **Notifications** | NotificationTemplate, Notification |
| **Audit** | ActivityLog, ApiKey |
| **Cart/Wishlist** | CartItem, WishlistItem |
| **Inventory** | InventoryLog |
| **Other** | ContactSubmission, Address |

## Media Library — 5 URL Variants

| Variant | Size | Use Case |
|---------|------|----------|
| Original | Full | Full resolution |
| Thumbnail | 100px | Gallery grids |
| Small | 300px | Product cards |
| Medium | 600px | Product detail |
| Large | 1200px | Hero banners |

Providers: `local` | `supabase` | `s3` | `cloudinary`

## Seed Data Highlights
- **Admin**: `admin` / `admin123` (super_admin)
- **Coupon**: `WELCOME10` (10% off, min $50)
- **Products**: 3 products with options/variants/media
- **Customer**: John Doe with address
- **Order**: Sample delivered order

## 16 API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/products` | List/Create |
| GET/PUT/DELETE | `/api/products/[id]` | CRUD |
| GET/POST | `/api/categories` | List/Create |
| GET/POST | `/api/orders` | List/Create |
| GET/PUT | `/api/orders/[id]` | Get/Update (supports payment/shipping status, creates OrderStatusHistory) |
| GET/POST | `/api/pages` | List/Create |
| GET/POST | `/api/banners` | List/Create |
| POST | `/api/admin/auth` | Login |
| PUT | `/api/admin/password` | Change password |
| GET/PUT | `/api/admin/settings` | Settings |
| POST | `/api/contact` | Contact form |
| GET | `/api/health` | DB health |
| GET | `/api/coupons/validate` | Validate coupon (expiry, usage, min order, discount calc) |

## Storefront Pages
| Page | Route | Features |
|------|-------|----------|
| Home | `/` | Banner hero, featured/latest products |
| Products | `/products` | Grid with pagination (12/page), category/sort filters, search |
| Product Detail | `/products/[slug]` | Interactive gallery, attributes, stock urgency, trust badges |
| Cart | `/cart` | Qty controls, coupon input w/ live discount, tax/shipping estimate |
| Checkout | `/checkout` | Payment method (COD/Stripe/UPI), structured address, coupon validation, live breakdown |
| Payment | `/payment/[id]` | Card form w/ validation, UPI input, COD confirmation |
| Order Success | `/checkout/success` | Order details, items, shipping, next-steps CTA |
| Order Tracking | `/order/tracking` | Step tracker (Placed→Confirmed→Processing→Shipped→Delivered) |
| About | `/about` | Brand story, values, feature cards |
| Contact | `/contact` | Contact form |

## Key Architecture Patterns
- **Guest cart**: Zustand → localStorage, hydrated on mount
- **Stock decrement**: Orders use `$transaction` for atomic stock deduction + InventoryLog creation
- **Admin auth**: JWT → localStorage, lazy client-side check
- **Dynamic pages**: `force-dynamic` + try-catch → graceful degradation
- **Snapshots**: Order items/addresses frozen at time of order
- **Media isolation**: All URLs through Media model, never directly on entities
- **Coupon flow**: Validate via API (expiry, usage count, min order) → apply in `POST /orders`
- **Server Components**: Event handlers extracted to Client Components (`ProductFilters`, `ProductGallery`, `AddToCartButton`)
- **DB failover**: 30s health check, 3 strikes → Supabase

## Where to Find Everything

| What you need | File |
|---------------|------|
| Agent state, do's/don'ts, commands | `AGENTS.md` |
| System design, data flow | `ARCHITECTURE.md` |
| Technical patterns, component list | `NOX_REFERENCE.md` |
| Quick overview (this file) | `NOX_SUMMARY.md` |
| Database schema | `prisma/schema.prisma` |
| AI skills | `.opencode/skills/*/SKILL.md` |

## Build Status
- TypeScript: 0 errors
- ESLint: 0 errors (1 pre-existing warning in seed.ts)
- Prisma: validates clean

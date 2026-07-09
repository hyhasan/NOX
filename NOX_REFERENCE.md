# NOX — Technical Reference

> **Purpose**: Deep technical patterns, all client components, media relations, edge cases.
> **Quick start**: `AGENTS.md` for state/commands/do-dont. `ARCHITECTURE.md` for system design.
> **Usage**: Search this file for specific patterns before writing new code.

---

## 1. Component Patterns

### Client vs Server Components
- **Server Components** (default): Page components that fetch data — homepage, products, about, dynamic pages
- **Client Components**: Any component with `"use client"` — 16+ total across the app

### All Client Components
- `src/components/layout/cart-provider.tsx`
- `src/components/layout/header.tsx`
- `src/components/storefront/product-card.tsx`
- `src/components/storefront/banner-hero.tsx`
- `src/components/admin/admin-layout.tsx`
- `src/components/ui/toast.tsx` — Toast context + useToast hook
- `src/components/ui/error-boundary.tsx`
- `src/app/products/[slug]/add-to-cart-button.tsx`
- `src/app/products/[slug]/product-gallery.tsx` — Interactive image thumbnail gallery
- `src/app/products/product-filters.tsx` — Category/sort <select> for Server Component product listing
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/checkout/success/page.tsx`
- `src/app/payment/[id]/page.tsx`
- `src/app/order/tracking/page.tsx`
- `src/app/contact/page.tsx`
- All `src/app/admin/*/page.tsx`

### UI Components (`src/components/ui/`)
All support `cn()` className merging. Pattern:
```tsx
<Button variant="default|outline|ghost|link" size="sm|md|lg" asChild>
<Badge variant="default|success|warning|danger|secondary|outline" />
<Card><CardHeader><CardTitle>...</CardTitle></CardHeader><CardContent>...</CardContent></Card>
<Input />, <Textarea />, <Label />, <Skeleton />
<Select options={[{value, label}]} />
<ToastProvider> → useToast() → { toast({ type, title, message }) }
<ErrorBoundary fallback={...}><App /></ErrorBoundary>
```

## 2. Admin Portal

### Auth Flow (see `AGENTS.md §5` for DON'Ts)
1. `AdminLayout` reads `localStorage.getItem("nox-admin")` in lazy state initializer
2. If null → redirect to `/admin/login`
3. Login POSTs to `/api/admin/auth`, stores `{ admin, token }` in localStorage
4. Protected mutations send `Authorization: Bearer <token>`
5. Logout clears `nox-admin` + `nox-admin-token`

### Admin CRUD Pattern (with Toast)
```tsx
const { toast } = useToast();
// load(), save(e) with validation + error handling, remove(id) with confirm
// toast({ type: "success"|"error", title, message }) on each outcome
```

### Toast Feedback per Admin Page
- **Products**: Name/price validation, save/delete success/error
- **Categories**: Name validation, save/delete success/error
- **Banners**: Image URL (image_id) validation, save/delete success/error
- **Orders**: Status update success/error
- **Appearance**: Save with try-catch connection handling
- **Settings**: Session expiry, password validation, success/error
- **Login**: 401/429/network error messages

## 3. Cart System

### Zustand Store (`src/lib/store.ts`)
- **Storage**: localStorage key `"nox-cart"`
- **Hydration**: `CartProvider` → `loadFromStorage()` on mount
- **Items**: `{ product_id, name, price, image_url, quantity, slug, sku? }`
- **Functions**: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getTotal`, `getItemCount`

### Flow
1. User clicks "Add to Cart" → Zustand `addItem()` → localStorage (toast feedback, max qty = stock)
2. Product card shows "In Cart" state + "Add More" if already in cart; disabled if out of stock
3. Cart page renders with qty controls, line totals, coupon input (live discount preview), estimated tax + shipping
4. Checkout sends payload (items, address, coupon_code, payment_method) to `POST /api/orders`
5. `POST /api/orders` validates stock, applies coupon (increments `used_count`), decrements stock via `$transaction`, creates `InventoryLog` entries
6. Success → `clearCart()`, redirect to `/checkout/success?order_id=xxx`

## 4. Media Library System

### Architecture
```
MediaFolder (hierarchical, self-referencing)
  └── Media (centralized file store)
        ├── url, thumbnail_url, small_url, medium_url, large_url
        ├── mime_type, extension, file_size, width, height
        ├── duration (video), is_animated (GIF)
        ├── storage_provider, storage_bucket, storage_key
        ├── blur_hash (image placeholders)
        ├── status: uploading → processing → ready | failed
        └── uploaded_by: Admin relation

MediaUsage (polymorphic tracking)
  └── resource_type + resource_id + usage_type
```

### All Media Relations
- `Product` → `ProductMedia[]` → `Media` (gallery + variant-specific)
- `Category` → `CategoryMedia[]` → `Media`
- `Banner` → `image` + `mobile_image` → `Media`
- `Brand` → `logo` → `Media`
- `Page` → `og_image` → `Media`
- `Admin` → `avatar` → `Media`
- `Customer` → `avatar` → `Media`
- `SiteSetting` → `image` → `Media`
- `Redirect` → `image` → `Media`
- `Review` → `ReviewMedia[]` → `Media`
- `ProductOptionValue` → `media` (swatch) → `Media`

### Storage Providers (extensible)
```ts
storage_provider: "local" | "supabase" | "s3" | "cloudinary"
```

## 5. Product Options & Variants

Structured system (replaces flat `option1_name/value`):

```
Product
  └── ProductOption (e.g., "Size", type: "select|radio|color_swatch")
        └── ProductOptionValue (e.g., "S", "M", "L" with optional swatch media)
  └── ProductVariant (SKU, price, stock)
        └── VariantOptionValue (junction: variant ↔ option values)
```

## 6. Order System

### Snapshot Pattern
- `Order.shipping_address_snapshot` — JSON copy at order time (street, city, state, zip)
- `OrderItem.product_name_snapshot` — frozen at order time
- `OrderItem.price_snapshot`, `total_snapshot`, `tax_snapshot`, `tax_rate_snapshot`

### Status Lifecycle
```
pending → confirmed → processing → shipped → in_transit → delivered
                                                          → cancelled (any state)
                                                          → returned / partially_returned
```

### Stock Decrement (Critical — `POST /api/orders`)
- Wrapped in `prisma.$transaction(async (tx) => { ... })` for atomicity
- Before creating order: validates stock for each item (`tx.product.findUnique` → check `stock >= requested`)
- Creates order with calculated amounts
- Decrements `product.stock` via `tx.product.update({ where: { id }, data: { stock: { decrement: qty } } })`
- Creates `InventoryLog` entry per product with `change: -qty`, `reason: "order"`, `reference: orderId`

### Coupon Application (`POST /api/orders`)
- If `coupon_code` provided: lookup code + validate expiry, `max_uses`, `min_order_amount`
- Apply discount: percentage → `total_amount * (coupon.discount_percentage / 100)`, fixed → `Math.min(coupon.discount_amount, total_amount)`
- Increment `coupon.used_count`
- Creates `CouponUsage` record linked to order

### Automatic Calculations (`POST /api/orders`)
- **Subtotal**: Sum of `(item.price_snapshot * quantity)` for all items
- **Shipping**: $9.99 flat, **free** if subtotal > $50
- **Tax**: 8% of subtotal
- **Discount**: From coupon validation
- **Total**: `subtotal + shipping + tax - discount`

### PUT /api/orders/[id]
- Supports updating `payment_status` + `paid_at`, `shipping_status` + `notes`
- Creates `OrderStatusHistory` entry for each status change
- Setting status = `cancelled` soft-deletes (sets `deleted_at`)

### Payment
- Multiple transactions per order (retry, split)
- `PaymentTransaction.gateway_response` — raw JSON from gateway
- `Refund` linked to payment + return

## 7. Coupon System

### Coupon Model Fields
- `code`, `type` (percentage|fixed), `discount_percentage`, `discount_amount`
- `max_uses` (null = unlimited), `used_count` (incremented on use)
- `min_order_amount` (null = no minimum), `starts_at`, `expires_at`

### Validate API (`GET /api/coupons/validate?code=WELCOME10&subtotal=100`)
Returns `{ valid, discount, discount_type, message }` or `{ valid: false, message }`.
Validation steps:
1. Lookup code (404 if not found)
2. Check `expires_at` (expired if past)
3. Check `starts_at` (not yet active if future)
4. Check `max_uses` vs `used_count` (exhausted)
5. Check `min_order_amount` vs subtotal (below minimum)
6. Calculate discount amount (percentage * subtotal or fixed amount)

### Cart Integration
- Cart page calls `/api/coupons/validate?code=X&subtotal=Y` on blur/Enter
- Shows live discount preview
- Checkout applies coupon on order creation (server-side verification)

## 8. Health Check & DB Failover

### `src/lib/health-check.ts`
```ts
const FAILURE_THRESHOLD = 3  // after 3 consecutive → failover
checkDatabaseHealth()        // ping + increment on failure
triggerFailover()            // switch to SUPABASE_URL
getHealthStatus()            // { status, database, failoverActive, lastChecked }
resetFailover()              // manual reset
```

## 9. Decimal Serialization

### `src/lib/serialize.ts`
```ts
serializeProduct(p)  // Number(price), Number(compare_price), Number(cost)
serializeOrder(o)    // Number(total_amount), items[].Number(price_snapshot)
```

### Usage
- **Server Components passing to Client**: Must serialize
- **API routes**: Automatically serialized by Next.js

## 10. Build & Error Handling

### Dynamic Rendering
`export const dynamic = "force-dynamic"` on: `page.tsx`, `products/page.tsx`, `products/[slug]/page.tsx`, `about/page.tsx`, `[slug]/page.tsx`

### Error Handling Stack
1. **Toast** (`useToast`): Runtime user feedback — validation, success, API errors
2. **ErrorBoundary**: Catches render exceptions, shows retry button
3. **`error.tsx`**: Global error page
4. **`not-found.tsx`**: Custom 404
5. **DB try-catch**: Server components fall back to empty arrays
6. **API try-catch**: All routes wrapped, return `{ error }` JSON

## 11. Docker Setup

### `docker-compose.yml`
- `postgres:18-alpine` (port 5432)
- `redis:7-alpine` (port 6379)
- `app` (multi-stage Dockerfile)

### `Dockerfile`
- `deps` → `builder` → `runner` (node:22-alpine)
- Runs as `nextjs` user on port 3000

## 12. Design Tokens

Defined in `src/app/globals.css`:
```css
:root {
  --color-primary: #1C1917; --color-accent: #A16207;
  --color-background: #FAFAF9; --color-destructive: #DC2626;
  --color-muted: #F5F5F4; --color-border: #E7E5E4;
}
```

Custom classes: `.container-site`, `.feature-card` (glassmorphism), `.glass-card-solid`, `.morph-transition`

## 13. Database Indexing Strategy

All 33 models include performance indexes:
- **Foreign keys**: Every `_id` field indexed
- **Lookup fields**: `slug`, `sku`, `barcode`, `code`, `email`, `token`, `key`, `from_path`
- **Filter fields**: `status`, `is_active`, `is_approved`, `order_status`, `payment_status`, `file_type`, `mime_type`
- **Sort fields**: `created_at`, `sort_order`, `published_at`
- **Composite indexes**: `(product_id, is_primary)`, `(position, is_active, sort_order)`, `(category_id, is_primary)`, `(resource_type, resource_id)`, `(action, resource_type)`, `(reference_type, reference_id)`
- **Unique indexes**: All `@unique` decorators plus composite uniques like `(customer_id, product_id)` on reviews/wishlist, `(variant_id, option_value_id)`, `(coupon_id, product_id)`, `(media_id, resource_type, resource_id, usage_type)`

## 14. Adding New Features

### New Page
```bash
src/app/faq/page.tsx           # Static
src/app/faq/[id]/page.tsx      # Dynamic
```
- Add `force-dynamic` + try-catch if using DB

### New Admin Section (see `AGENTS.md §6` for file map)
```bash
# 1. Nav item in admin-layout.tsx
# 2. Page at src/app/admin/<section>/page.tsx
# 3. API routes at src/app/api/<section>/route.ts
```

### New Media Type (see `AGENTS.md §4` — DO use Media model)
```bash
# 1. Add relation to Media model in schema.prisma
# 2. Create using media_id in API/seed
# 3. Access via relation include
```

### New API Route (see `AGENTS.md §5` — always use try-catch)
```bash
# src/app/api/<resource>/route.ts
# Export GET, POST, PUT, DELETE
# Always use try-catch with error response
# Return { data } on success, { error } on failure
```

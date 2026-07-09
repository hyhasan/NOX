# NOX Architecture

> **Purpose**: System design, data flow, and rendering strategy.
> **Companion docs**: `AGENTS.md` (state/commands/do-dont), `NOX_REFERENCE.md` (deep technical patterns), `NOX_SUMMARY.md` (quick overview).

---

## 1. System Overview

```
Client Browser
     │
     ├── Storefront (Next.js SSR) ────┐
     ├── Admin Portal (CSR + JWT) ────┤
     └── Cart (Zustand + localStorage)─┤
                                       │
                              Next.js App Router
                               │           │
                        Server Components   API Routes (REST)
                               │                │
                        React Server Components  JSON Response
                               │                │
                              ┌─┴────────────────┘
                              │
                     ┌────────┴────────┐
                     │   Prisma ORM    │
                     │  (@prisma/client)│
                     └────────┬────────┘
                              │
                     ┌────────┴────────┐
                     │   PostgreSQL    │
                     │  (with Supabase │
                     │    failover)    │
                     └─────────────────┘
```

## 2. Rendering Strategy

| Layer | Strategy | Key Files (see `AGENTS.md §6`) |
|---|---|---|
| Storefront pages | Server Components with `force-dynamic`, DB try-catch fallback | `src/app/(pages)/page.tsx` |
| Admin pages | Client Components with JWT auth, lazy localStorage init | `src/components/admin/admin-layout.tsx` |
| Cart | Zustand client store, localStorage persistence | `src/lib/store.ts` |
| Checkout | Client form → POST /api/orders with `$transaction` stock decrement | `src/app/checkout/page.tsx` |
| Payment | Client form → COD/Stripe card/UPI with validation | `src/app/payment/[id]/page.tsx` |
| Order Tracking | Client component → GET /api/orders/[id] → step tracker | `src/app/order/tracking/page.tsx` |
| Coupon Validate | API-only → GET /api/coupons/validate with full validation | `src/app/api/coupons/validate/route.ts` |
| API routes | Edge/serverless ready, JSON responses | `src/app/api/*` (16 routes) |

## 3. Data Flows

### Storefront (Server Component → Client)
```
Page (Server Component)
  → prisma.model.findMany() with try-catch
  → Serialize Decimals via serializeProduct() / serializeOrder()
  → Pass props to Client Components
  → Render
```

### Admin (Client-Only)
```
AdminLayout
  → Check localStorage for "nox-admin" token
  → If null → redirect to /admin/login
  → If valid → fetch data via API routes
  → Render page with useToast() feedback
```

### Cart + Order (Zustand → API → Stock Decrement)
```
addItem() → updates Zustand state + localStorage
CartProvider → hydrates from localStorage on mount
Checkout → reads cart state → POST /api/orders
  → $transaction:
    1. Validate stock for each item
    2. Apply coupon (validate + increment used_count + create CouponUsage)
    3. Calculate subtotal, shipping (free >$50), tax (8%), discount
    4. Create Order + OrderItems with snapshots
    5. Decrement product.stock
    6. Create InventoryLog entries (reason: "order")
  → clearCart()
  → Redirect to /checkout/success?order_id=xxx
```

### Coupon Validation (Cart → API → Checkout)
```
Cart page: input coupon → blur/Enter → GET /api/coupons/validate?code=X&subtotal=Y
  → Server: validate expiry, max_uses, min_order_amount
  → Returns: { valid, discount, discount_type, message }
  → Cart displays live discount preview

Checkout: coupon_code in POST body → server re-validates + applies
```

### Media (Upload → Store → Reference)
```
Upload → Sharp processing → 5 variants → Store in Media model
  → Referenced via media_id on entities (ProductMedia, CategoryMedia, etc.)
  → MediaUsage tracks all usage polymorphically
```

## 4. Database Architecture

### Extensions
- `pg_boss` — job queues (email, image processing, inventory sync)
- `citext` — case-insensitive unique fields (email, slug)
- `pgcrypto` — gen_random_uuid() if needed

### Key Design Patterns
- **Snapshots**: Order items and addresses frozen at checkout time (`OrderItem.price_snapshot`, `Order.shipping_address_snapshot`)
- **Media isolation**: All URLs through `Media` model — never store image URLs directly on business entities
- **Soft relations**: `MediaUsage` for polymorphic tracking across 11+ resource types
- **Inventory**: Multi-warehouse with `WarehouseStock.reserved` for pending orders
- **Pricing**: Tiered + group-based via `PriceList`/`ProductPrice` with priority resolution

### Failover Strategy
```
Health Check (30s interval via src/lib/health-check.ts)
  → 3 consecutive failures → triggerFailover()
  → Switch DATABASE_URL to SUPABASE_URL
  → resetFailover() on manual recovery
```

## 5. API Layer

All routes at `src/app/api/<resource>/route.ts` (16 total):
| Method | Behavior | Auth |
|--------|----------|------|
| GET | List or single (query params for filtering) | Public or JWT |
| POST | Create | Public or JWT |
| PUT/PATCH | Update | JWT required |
| DELETE | Remove | JWT required |

**Every route** uses try-catch: `return NextResponse.json({ data })` or `{ error }`.

Key new routes:
- `POST /api/orders` — Stock decrement via `$transaction`, coupon application, auto tax/shipping/discount
- `PUT /api/orders/[id]` — Payment/shipping status updates, creates `OrderStatusHistory`, soft-cancel via `deleted_at`
- `GET /api/coupons/validate` — Validates expiry, use count, min order; returns discount amount

## 6. Auth System

```
POST /api/admin/auth { username, password }
  → bcrypt.compare() → JWT.sign() → { admin, token }

Protected routes:
  Authorization: Bearer <token>
  → verifyToken(request) → { adminId, role }
  → role-based access checks

PUT /api/admin/password { current_password, new_password }
  → verify old password → hash new → update
```

See `AGENTS.md §6` for all auth-related files.

## 7. Error Handling Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| Toast | `useToast()` (src/components/ui/toast.tsx) | Runtime user feedback |
| ErrorBoundary | `src/components/ui/error-boundary.tsx` | Catches render exceptions |
| error.tsx | `src/app/error.tsx` | Global error page |
| not-found.tsx | `src/app/not-found.tsx` | Custom 404 |
| DB try-catch | Server components | Fall back to empty arrays |
| API try-catch | All API routes | Return `{ error }` JSON |

## 8. State Management Map

| State | Tool | Storage | Key |
|-------|------|---------|-----|
| Cart | Zustand | localStorage | `nox-cart` |
| Admin auth | useState + useEffect | localStorage | `nox-admin`, `nox-admin-token` |
| Theme | next-themes | localStorage | — |
| Server data | Server Components | DB queries | — |
| UI state | React state | Component-local | — |

## 9. Project Structure

```
src/
├── app/                    # Pages + 16 API routes
│   ├── admin/              # 9 admin pages
│   ├── products/           # Listing + detail (with ProductFilters client component)
│   ├── products/[slug]/    # Detail with ProductGallery + AddToCartButton client components
│   ├── cart/               # Guest cart with coupon input, tax/shipping estimate
│   ├── checkout/           # Checkout form + success confirmation
│   ├── payment/            # Payment gateway (COD, Stripe card, UPI)
│   ├── order/              # Order tracking with visual step tracker
│   ├── about/              # Brand story page
│   └── api/
│       ├── coupons/validate/  # Coupon validation endpoint
│       └── ...                 # 15 other API routes
├── components/
│   ├── ui/                 # 10 reusable components
│   ├── layout/             # Header, Footer, CartProvider
│   ├── storefront/         # ProductCard, BannerHero
│   └── admin/              # AdminLayout
├── lib/                    # prisma, auth, store, serialize, health-check, upload, utils
└── types/                  # TypeScript interfaces
```

## 10. Configuration Files Reference

| File | Purpose | See Also |
|------|---------|----------|
| `tsconfig.json` | TypeScript config | `AGENTS.md §7` commands |
| `next.config.ts` | Next.js standalone output | — |
| `eslint.config.mjs` | ESLint — ignores `.opencode/` | `AGENTS.md §7` |
| `tailwind.config.ts` | Tailwind CSS 4 config | `NOX_REFERENCE.md §12` |
| `.env.example` | All env vars documented | `AGENTS.md §8` |
| `docker-compose.yml` | Postgres + Redis + App | `NOX_REFERENCE.md §11` |

# NOX — Agent Command Center

**Read this file first every session.** It tracks project state, session history, do's/don'ts, and maps where everything lives.

---

## 1. First-Time Reading Order

To understand the full project, read these in order:

| Order | File | What It Tells You |
|-------|------|-------------------|
| 1 | `ARCHITECTURE.md` | System design, data flow, rendering strategy |
| 2 | `NOX_SUMMARY.md` | Quick overview, tech stack, all 33 models |
| 3 | `NOX_REFERENCE.md` | Deep technical patterns, all client components, media relations |
| 4 | `prisma/schema.prisma` | All 33 models, relations, indexes |
| 5 | `.opencode/opencode.jsonc` | Project's OpenCode configuration |

---

## 2. Session Log

*Append new sessions at the bottom. Agents: read this to know where you left off.*

### Session 2026-07-09 — Initial AI Infrastructure Build
- Created `AGENTS.md` — Master command center for AI agents
- Created `ARCHITECTURE.md` — System design and data flow documentation
- Created `.opencode/opencode.jsonc` — Project-level OpenCode config with skill auto-detect
- Created 4 new skills: `commerce`, `database`, `media`, `admin` under `.opencode/skills/`
- Created `prisma.config.ts` — Prisma 7.x readiness (excluded from tsc)
- Updated `.env.example` — Added Redis, storage provider, JWT config, SMTP from
- Updated `eslint.config.mjs` — Added `.opencode/` to ignores
- Fixed `tsconfig.json` — Added `prisma.config.ts` to exclude
- **Build status**: TypeScript 0 errors, ESLint 0 errors (1 pre-existing warning in seed.ts)
- **Skills added**: commerce, database, media, admin (4 domain-specific)

### Session 2026-07-09 — Full Product→Payment Flow Build
- **Critical fix**: `POST /api/orders` — Added stock decrement via `$transaction`, inventory logging, stock validation before order, coupon validation & application, automatic tax/shipping/discount calculation
- **New page**: `/checkout/success` — Order confirmation with order details, items list, shipping info, payment summary, next-steps CTA
- **New page**: `/payment/[id]` — Full payment gateway page with COD, card (Stripe-style form with validation), and UPI/Razorpay options
- **New page**: `/order/tracking` — Order lookup by number with visual step tracker (Placed→Confirmed→Processing→Shipped→Delivered), order summary
- **New page**: `/about` — Brand story, values, feature cards
- **New API**: `GET /api/coupons/validate` — Validates coupon codes with expiry, usage limits, min order, type-based discount calculation
- **Upgraded**: `/checkout` — Payment method selection (COD/Stripe/Razorpay with radio cards), structured address (street/city/state/zip), coupon input with validation, live tax/shipping/discount breakdown, mobile-responsive summary toggle
- **Upgraded**: `/cart` — Coupon input with live discount preview, estimated tax & shipping calculation, `Free shipping on orders over $50` messaging, add-to-cart toast feedback
- **Upgraded**: Product detail — Interactive image gallery (click thumbnail to swap), attribute details display, stock urgency (`Only N left`), trust badges, stock-aware Add to Cart (max qty, in-cart state)
- **Upgraded**: Product card — Discount badge on image overlay, in-cart state with `+ Add More`, add-to-cart toast feedback, out-of-stock disabled state
- **Upgraded**: Product listing — Pagination (12 per page with page numbers), proper form-based filters (category/sort preserve other params), search icon
- **Fixed**: Empty cart redirect on checkout page (moved from render body to `useEffect`)
- **Fixed**: Footer "Featured" link (was `?status=active` which doesn't exist, now `?sort=price_desc`)
- **Fixed**: `PUT /api/orders/[id]` — Now supports `payment_status`, `paid_at`, `shipping_status`, `notes` fields + creates `OrderStatusHistory` entries, soft-delete via status cancel
- **Fixed**: `GET|PUT /api/orders/[id]` — Added `try-catch` + `serializeOrder`
- **Fixed**: `GET /api/orders` — Added email search filter + `try-catch` + `{ data }` wrapper
- **Fixed**: `CartItem` type — Added optional `sku` field
- **Fixed**: Product card + AddToCartButton — Now pass `sku` in add item payload
- **Build status**: TypeScript 0 errors, ESLint 0 errors (1 pre-existing warning in seed.ts)
- **State changes**: Moved checkout success, payment, order tracking, about, coupon validate from "Not Yet Built" to "Built & Ready"

### Session 2026-07-09 — Full Admin Dashboard Build (Continued)
- **New API**: `GET/POST /api/admin/users` — Admin user CRUD (list, create with role + validation)
- **New API**: `GET/PUT/DELETE /api/admin/users/[id]` — Admin user single CRUD (update, delete, self-protection)
- **New page**: `/admin/users` — Full admin user management UI with table, create/edit forms, role badges, self-protection
- **New**: Admin Users link added to sidebar navigation
- **Enhanced**: Dashboard — added Quick Actions section (Create Product, View Orders, Manage Admins, Manage Coupons)
- **Build status**: TypeScript 0 errors, ESLint 0 errors (4 pre-existing warnings)
- **State changes**: Admin users moved from "Not Yet Built" to "Built & Ready"

### Session 2026-07-09 — Banner Popup/Promo Enhancement
- **Enhanced**: `/admin/banners` — Added subtitle, link_text, bg_color (color picker), text_color (color picker) fields
- **New positions**: `popup` (Popup Offer with modal card preview + close button) and `promo` (Promo Bar with inline styling)
- **Live preview panel**: Side-by-side visual preview showing banner as popup modal, promo bar, or hero image
- **Schema**: Added `image_url` field to Banner model (`prisma/schema.prisma`)
- **Fixed**: `POST /api/banners` and `PUT /api/banners/[id]` — now persist `image_url`, `bg_color`, `text_color`, `subtitle`, `link_text`
- **Build status**: TypeScript 0 errors, ESLint 0 errors (5 pre-existing warnings)
- **State changes**: Banner popup/promo moved from "Not Yet Built" to "Built & Ready"

### Session 2026-07-09 — Full Admin Dashboard Build
- **Fixed**: Admin login redirect — Changed `AdminRootLayout` to use `key={pathname}` so `AdminLayout` remounts on route change, re-reading localStorage from `useState` initializer
- **Fixed**: All admin pages now handle `{ data }` API wrapper (dashboard, products, orders, categories, pages, banners)
- **Fixed**: Dashboard data fetching — added `json.data || json` fallback, error state, today's sales, pending orders count, orders-by-status breakdown
- **Enhanced**: Dashboard — added today's sales trend, pending orders badge, low stock count, orders by status summary, error state, date display
- **Enhanced**: Settings page — now includes full site settings section (site name, tagline, logo, favicon, support email/phone, address, SEO defaults, currency, tax rate, free shipping threshold, footer text) plus admin credentials section
- **New API**: `GET/POST /api/coupons` — Coupon CRUD (list, create with validation, unique code check)
- **New API**: `GET/PUT/DELETE /api/coupons/[id]` — Coupon single CRUD (get, update, delete)
- **New page**: `/admin/coupons` — Full coupon management UI with form (code, type, value, limits, dates, active/stackable toggles), table (code, discount, usage, status, expiry, actions)
- **New**: Coupon link added to sidebar navigation
- **Fixed**: All API GET routes wrapped with `try-catch` + `{ data }` wrapper (categories, pages, banners, products)
- **Fixed**: All bare-array API responses now use `{ data: [...] }` format for consistency
- **Added**: `serializeCoupon()` and enhanced `serializeOrder()` in `src/lib/serialize.ts`
- **Build status**: TypeScript 0 errors, ESLint 0 errors (4 pre-existing warnings)
- **State changes**: Coupons moved from "Not Yet Built" to "Built & Ready"

### Session 2026-07-09 — Render Deployment Setup
- **Created**: `render.yaml` — Blueprint with Web Service + PostgreSQL DB, env vars, health check
- **Created**: Prisma migration — `prisma/migrations/20260709000000_init/migration.sql` (full 33-table schema)
- **Created**: `prisma/migrations/migration_lock.toml` — Postgres provider lock
- **Created**: `prisma/migrations/20260709000000_init/migration.json` — Migration metadata
- **Build status**: TypeScript 0 errors, ESLint 0 errors (1 pre-existing warning in seed.ts)

---

## 3. Project State Tracker

### ✅ Built & Ready
| Feature | Status | Key Files |
|---------|--------|-----------|
| 33-model Prisma schema | ✅ Complete | `prisma/schema.prisma` |
| Prisma client singleton | ✅ Complete | `src/lib/prisma.ts` |
| Seed data (15+ entities) | ✅ Complete | `prisma/seed.ts` |
| JWT admin auth | ✅ Complete | `src/lib/auth.ts`, `src/app/api/admin/auth/route.ts` |
| DB health + Supabase failover | ✅ Complete | `src/lib/health-check.ts` |
| Decimal serialization | ✅ Complete | `src/lib/serialize.ts` |
| Zustand guest cart | ✅ Complete | `src/lib/store.ts` |
| File upload utilities | ✅ Complete | `src/lib/upload.ts` |
| Admin portal — dashboard | ✅ Complete | `src/app/admin/dashboard/page.tsx` |
| Admin portal — products CRUD | ✅ Complete | `src/app/admin/products/page.tsx` |
| Admin portal — orders management | ✅ Complete | `src/app/admin/orders/page.tsx` |
| Admin portal — categories CRUD | ✅ Complete | `src/app/admin/categories/page.tsx` |
| Admin portal — CMS pages | ✅ Complete | `src/app/admin/pages/page.tsx` |
| Admin portal — banners (hero/promo/popup) | ✅ Complete | `src/app/admin/banners/page.tsx` |
| Admin portal — settings (site + credentials) | ✅ Complete | `src/app/admin/settings/page.tsx` |
| Admin portal — appearance | ✅ Complete | `src/app/admin/appearance/page.tsx` |
| Admin portal — coupons CRUD | ✅ Complete | `src/app/admin/coupons/page.tsx` |
| Admin portal — admin users management | ✅ Complete | `src/app/admin/users/page.tsx` |
| Product→Payment flow (8 pages) | ✅ Complete | product, cart, checkout, payment, success, tracking |
| Coupon validate API | ✅ Complete | `src/app/api/coupons/validate/route.ts` |
| Coupon CRUD API | ✅ Complete | `src/app/api/coupons/**/*.ts` |
| Admin users CRUD API | ✅ Complete | `src/app/api/admin/users/**/*.ts` |
| Stock dec/inventory logging | ✅ Complete | `POST /api/orders` via `$transaction` |
| About page | ✅ Complete | `src/app/about/page.tsx` |
| 21 API routes | ✅ Complete | `src/app/api/*` |
| Banner popup/promo support | ✅ Complete | `prisma/schema.prisma` — Banner model |
| 10 UI components | ✅ Complete | `src/components/ui/*` |
| Docker setup | ✅ Complete | `docker-compose.yml`, `Dockerfile` |
| Liquid Glass design system | ✅ Complete | `src/app/globals.css` |
| AI documentation | ✅ Complete | AGENTS.md, ARCHITECTURE.md, NOX_REFERENCE.md, NOX_SUMMARY.md |

### 🔄 In Progress
| Feature | Status | Notes |
|---------|--------|-------|
| — | — | — |

### 📋 Not Yet Built
| Feature | Priority | Notes |
|---------|----------|-------|
| Customer registration/login | Medium | Customer model exists, no auth flow |
| Media upload API endpoint | Medium | `upload.ts` exists, no route yet |
| Email notification sending | Low | Templates seeded, SMTP configured |
| Image processing pipeline | Low | Sharp installed, not wired to uploads |
| Warehouse/inventory UI | Low | Models exist, no admin UI |
| Multi-currency | Low | Currency fields on Order, PriceList |
| Review moderation UI | Low | Review model complete, no admin UI |

---

## 4. DO's — Always Follow These

- ✅ **Read AGENTS.md first** every session to check state
- ✅ **Update session log** at end of every session
- ✅ **Run `npm run lint` + `npx tsc --noEmit`** after any code changes
- ✅ **Use `force-dynamic`** on every `page.tsx` that queries the database
- ✅ **Serialize Decimals** before passing to client components (`serializeProduct()`, `serializeOrder()`)
- ✅ **Use `cn()`** from `@/lib/utils` for className merging
- ✅ **Use `try-catch`** in every API route — return `{ data }` on success, `{ error }` on failure
- ✅ **Use `prisma` from `@/lib/prisma`** (the global singleton) — never `new PrismaClient()`
- ✅ **Index every `_id`** field, every filter/sort field in schema changes
- ✅ **Use `useToast()`** pattern for admin UI feedback: `toast({ type, title, message })`
- ✅ **Use skill files** (`skill commerce`, `skill database`, etc.) for domain-specific work
- ✅ **Remove unused imports** before finalizing any edit
- ✅ **Check existing patterns** in neighboring files before writing new code
- ✅ **Use existing opencode skills** in `.opencode/skills/` when relevant

## 5. DON'Ts — Never Do These

- ❌ **Don't** use `next-auth` — admin auth is custom JWT in localStorage
- ❌ **Don't** use `any` type — we already have `@typescript-eslint/no-explicit-any: "off"`, but avoid it anyway
- ❌ **Don't** store image URLs directly on business entities — always go through `Media` model (exception: Banner.image_url for direct URL convenience)
- ❌ **Don't** use `require()` in `.ts` files — only `.cjs` scripts may use it
- ❌ **Don't** import from `@prisma/client` directly — use `@/lib/prisma`
- ❌ **Don't** miss `@db.Decimal(10, 2)` on monetary fields in schema
- ❌ **Don't** create new `.env` files — template is `.env.example`
- ❌ **Don't** commit changes unless explicitly asked
- ❌ **Don't** add comments to code (unless absolutely necessary for clarity)
- ❌ **Don't** add emojis to files unless the user asks
- ❌ **Don't** create documentation files (*.md) unless explicitly requested
- ❌ **Don't** use `&&` in PowerShell — use `cmd1; if ($?) { cmd2 }` instead
- ❌ **Don't** use `cd` in bash commands — use the `workdir` parameter instead

---

## 6. Key File Map

### Prisma / Database
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | 33 models, relations, indexes, extensions |
| `prisma/seed.ts` | Seed data: admin, products, media, orders, etc. |
| `prisma.config.ts` | Prisma 7.x config (future upgrade, excluded from tsc) |
| `src/lib/prisma.ts` | Prisma client global singleton |

### Auth
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | JWT sign, verify, password hash helpers |
| `src/app/api/admin/auth/route.ts` | Login endpoint |
| `src/app/api/admin/password/route.ts` | Change password endpoint |

### API Routes (all in `src/app/api/`)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/products` | GET, POST | List, create |
| `/api/products/[id]` | GET, PUT, DELETE | Single product CRUD |
| `/api/categories` | GET, POST | List, create |
| `/api/orders` | GET, POST | List, create |
| `/api/orders/[id]` | GET, PUT | Get, update status |
| `/api/pages` | GET, POST | CMS pages |
| `/api/banners` | GET, POST | Banners |
| `/api/admin/auth` | POST | Login |
| `/api/admin/password` | PUT | Change password |
| `/api/admin/settings` | GET, PUT | Site settings |
| `/api/admin/password` | PUT | Change password |
| `/api/admin/users` | GET, POST | Admin users CRUD |
| `/api/admin/users/[id]` | GET, PUT, DELETE | Single admin user |
| `/api/coupons` | GET, POST | Coupons CRUD |
| `/api/coupons/[id]` | GET, PUT, DELETE | Single coupon |
| `/api/coupons/validate` | GET | Validate coupon code |
| `/api/contact` | POST | Contact form |
| `/api/health` | GET | DB health check |

### Library (`src/lib/`)
| File | Purpose |
|------|---------|
| `prisma.ts` | DB client singleton |
| `auth.ts` | JWT + bcrypt |
| `store.ts` | Zustand cart |
| `serialize.ts` | Decimal → Number |
| `upload.ts` | File upload helpers |
| `health-check.ts` | DB ping + failover |
| `utils.ts` | `cn()` + shared utils |

### Components
| Path | Purpose |
|------|---------|
| `src/components/ui/` | 10 shared UI components (Button, Card, Input, Badge, Select, Toast, etc.) |
| `src/components/layout/` | Header, Footer, CartProvider |
| `src/components/storefront/` | ProductCard, BannerHero |
| `src/components/admin/` | AdminLayout |

### Skills (`.opencode/skills/`)
| Skill | When to Activate |
|-------|-----------------|
| `commerce` | Cart, checkout, orders, products, pricing |
| `database` | Schema changes, migrations, queries, seeds |
| `media` | File uploads, image processing, media relations |
| `admin` | Admin portal auth, CRUD, settings |
| `brand` | Brand voice, visual identity, design tokens |
| `design` | UI design, styling, design system |
| `design-system` | Design tokens, component standards |
| `ui-styling` | CSS, Tailwind, component styling |
| `ui-ux-pro-max` | Advanced UI/UX patterns |
| `banner-design` | Banner creation and design |
| `slides` | Presentation slides |

---

## 7. Commands Reference

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint (runs on src/ only, not .opencode/)
npx tsc --noEmit         # TypeScript check (excludes prisma.config.ts)
npm run db:push          # Push schema to DB (dev)
npm run db:migrate       # Create migration (prod)
npm run db:seed          # Seed data
npm run db:studio        # Prisma Studio
npm run db:generate      # Regenerate Prisma client
```

---

## 8. Important Technical Notes

- **Prices**: All monetary fields use `@db.Decimal(10, 2)` in Prisma — must serialize before client
- **Dynamic rendering**: `export const dynamic = "force-dynamic"` on every page that queries DB
- **Cart**: Zustand + localStorage (guest only, key `nox-cart`)
- **Admin auth**: JWT in localStorage (keys `nox-admin` + `nox-admin-token`), checked in `AdminLayout`
- **Media model**: Central hub — ALL images/videos reference it, never direct URL fields
- **Health check**: Pings DB every 30s, 3 consecutive failures → switch to Supabase
- **Toast pattern**: `const { toast } = useToast()` → `toast({ type, title, message })`
- **DB extensions**: `pg_boss` (job queues), `citext` (case-insensitive), `pgcrypto` (UUID)
- **Seed admin**: `admin` / `admin123` (super_admin role)
- **Seed coupon**: `WELCOME10` (10% off, min $50)
- **Docker**: `docker compose up -d` starts Postgres + Redis + App

---

## 9. Agent Workflow Protocol

When I receive a task:
1. **Read AGENTS.md** → Check session log, state, do's/don'ts
2. **Activate relevant skill** → e.g. `skill commerce` for cart work
3. **Read key files** → Understand current implementation
4. **Implement** → Follow patterns in NOX_REFERENCE.md
5. **Verify** → `npm run lint` + `npx tsc --noEmit`
6. **Append to session log** → Record what was done

---

## 10. How to Update This File

When a session ends, append to the Session Log (section 2) with:
```
### Session YYYY-MM-DD — Brief Title
- What was built/changed
- Files created
- Build status
- Next steps / pending items
```

When a feature transitions from "Not Yet Built" → "In Progress" → "Built & Ready", update section 3.

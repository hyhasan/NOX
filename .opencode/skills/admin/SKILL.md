---
name: admin
description: Admin portal patterns — JWT auth, CRUD operations, role management, dashboard, settings. Activate for admin panel changes, auth flows, admin CRUD, permission management.
argument-hint: "[auth|crud|role|page|settings] [args]"
metadata:
  author: nox
  version: "1.0.0"
---

# Admin Portal

Admin panel with JWT authentication, role-based access, and CRUD management.

## Auth Flow

```
Login → POST /api/admin/auth { username, password }
  → bcrypt verify → JWT sign → { admin, token }
  → Store in localStorage: "nox-admin"

Protected Routes:
  Authorization: Bearer <token>
  → verifyToken() → { adminId, role }
  → 401 if invalid/expired

AdminLayout:
  → Reads localStorage "nox-admin" on mount
  → Redirects to /admin/login if null
```

## Admin Pages

| Path | Component | Purpose |
|------|-----------|---------|
| `/admin` | Dashboard | Summary stats |
| `/admin/login` | Login | Auth form |
| `/admin/products` | Products | Product CRUD |
| `/admin/categories` | Categories | Category CRUD |
| `/admin/orders` | Orders | Order management |
| `/admin/pages` | Pages | CMS pages |
| `/admin/banners` | Banners | Banner CRUD |
| `/admin/appearance` | Appearance | Theme settings |
| `/admin/settings` | Settings | Site settings |

## CRUD Pattern

```tsx
const { toast } = useToast();

// List
const [items, setItems] = useState([]);
const load = async () => { /* GET /api/resource */ };

// Create/Update
const save = async (e) => {
  e.preventDefault();
  // validate
  // POST/PUT /api/resource
  // toast({ type: "success", title, message })
  // reload
};

// Delete
const remove = async (id) => {
  if (!confirm("Are you sure?")) return;
  // DELETE /api/resource/[id]
  // toast({ type: "success", title, message })
  // reload
};
```

## Role System

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access |
| `admin` | CRUD on all resources |
| `manager` | Products, orders, categories |
| `editor` | Products, pages, banners |

## References

| Topic | File |
|-------|------|
| Auth utilities | `src/lib/auth.ts` |
| Admin layout | `src/components/admin/admin-layout.tsx` |
| Auth API | `src/app/api/admin/auth/route.ts` |
| Login page | `src/app/admin/login/page.tsx` |
| Password change | `src/app/api/admin/password/route.ts` |
| Settings API | `src/app/api/admin/settings/route.ts` |

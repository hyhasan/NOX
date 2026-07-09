---
name: commerce
description: E-commerce domain patterns — products, cart, checkout, orders, pricing, inventory, coupons. Activate for commerce operations, cart logic, order management, pricing strategies.
argument-hint: "[pattern|query|validate] [args]"
metadata:
  author: nox
  version: "1.0.0"
---

# Commerce

E-commerce domain operations: product catalog, cart/checkout flow, order lifecycle, pricing & inventory.

## When to Use

- Product catalog queries (filtering, sorting, search)
- Cart operations (add, remove, merge guest carts)
- Checkout flow and order creation
- Order status lifecycle and fulfillment
- Pricing strategies (tiered, group-based, sales)
- Inventory management (multi-warehouse, reservations)
- Coupon/discount validation and application

## Key Patterns

### Cart → Order Flow
```
Zustand Store (guest)
  → POST /api/orders
  → Order created with snapshot data
  → Cart cleared on success
```

### Order Status Lifecycle
```
pending → confirmed → processing → shipped → in_transit → delivered
                                                            → cancelled (any state)
                                                            → returned / partially_returned
```

### Snapshot Pattern
Frozen data at order time: `shipping_address_snapshot`, `product_name_snapshot`, `price_snapshot`

### Pricing Resolution
1. Check `ProductPrice` for matching pricelist
2. Fall back to `Product.price` (base)
3. Apply variant override if present

### Inventory Reservation
```
WarehouseStock.reserved += quantity  (on order placement)
WarehouseStock.quantity -= quantity  (on shipment)
InventoryLog records every change
```

## References

| Topic | Description |
|-------|-------------|
| `references/product-queries.md` | Product filtering, search, pagination patterns |
| `references/order-flow.md` | Full order lifecycle with status transitions |
| `references/cart-operations.md` | Cart CRUD, guest merge, validation |
| `references/pricing.md` | Price resolution, tiered pricing, currency |
| `references/coupons.md` | Coupon validation, stacking, restrictions |

## Key Files

- `src/lib/store.ts` — Zustand cart store
- `src/app/api/products/route.ts` — Product API
- `src/app/api/orders/route.ts` — Order API
- `src/app/cart/page.tsx` — Cart page
- `src/app/checkout/page.tsx` — Checkout page

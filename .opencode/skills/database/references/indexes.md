# Index Strategy

## Rules

1. **Every foreign key** gets `@@index([field_id])`
2. **Every slug** gets `@@index([slug])` or `@unique`
3. **Every status/is_active** filter gets an index
4. **created_at** gets an index (sorting)
5. **Composite indexes** for `(filter, sort)` pairs

## Composite Index Examples

```prisma
@@index([product_id, is_primary])       // Media lookups
@@index([position, is_active, sort_order]) // Banner ordering
@@index([category_id, is_primary])       // Category media
@@index([resource_type, resource_id])    // MediaUsage
@@index([action, resource_type])         // ActivityLog
@@index([reference_type, reference_id])  // InventoryLog
```

## Unique Constraints

```prisma
@@unique([customer_id, product_id])  // Reviews, Wishlist
@@unique([variant_id, option_value_id]) // Variant options
@@unique([coupon_id, product_id])     // Coupon products
@@unique([media_id, resource_type, resource_id, usage_type]) // MediaUsage
@@unique([option_id, value])          // Option values
@@unique([slug, parent_id])          // MediaFolders (per parent)
@@unique([warehouse_id, product_id, variant_id]) // Warehouse stock
@@unique([pricelist_id, product_id, variant_id, min_qty]) // Prices
```

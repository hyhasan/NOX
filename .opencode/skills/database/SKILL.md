---
name: database
description: Prisma ORM operations, schema design, migrations, queries, indexing strategies. Activate for schema changes, query optimization, data migrations, seed updates.
argument-hint: "[schema|migrate|query|seed|index] [args]"
metadata:
  author: nox
  version: "1.0.0"
---

# Database

Prisma ORM patterns, schema design, query optimization, and migration workflows.

## When to Use

- Schema model changes (new fields, relations, models)
- Migration creation and management
- Query optimization and indexing
- Seed data updates
- Complex Prisma queries (aggregations, filtering, includes)
- Performance analysis and index strategy

## Quick Reference

### Schema Changes
```bash
# Development (no migration needed)
npm run db:push

# Production (create migration)
npm run db:migrate -- --name add_field_to_product
```

### Common Commands
```bash
npm run db:push     # Push schema to DB (dev)
npm run db:migrate  # Create migration (prod)
npm run db:seed     # Re-seed data
npm run db:studio   # Prisma Studio GUI
npm run db:generate # Regenerate client
```

## Key Patterns

### Include Strategy
- Always include related media: `{ media: { include: { media: true } } }`
- Limit includes in list queries; full includes in detail queries
- Use `select` instead of `include` when only specific fields needed

### Index Checklist
Every new field should have:
- `@@index` on foreign keys (`_id` fields)
- `@@index` on filter fields (status, is_active)
- `@@index` on sort fields (created_at, sort_order)
- Composite indexes on `(filter, sort)` pairs

### Decimal Handling
- All monetary fields: `@db.Decimal(10, 2)`
- Must serialize with `serializeProduct()` / `serializeOrder()` before client
- Prisma returns Decimal as string → convert via `Number()` in serializers

### Extension Usage
- `pg_boss` — job queues (email, image processing, inventory)
- `citext` — case-insensitive lookups (email, slug)
- Enable in Supabase dashboard or raw SQL

## References

| Topic | File |
|-------|------|
| Schema conventions | `prisma/schema.prisma` |
| Seed data | `prisma/seed.ts` |
| Query examples | `references/queries.md` |
| Index strategy | `references/indexes.md` |
| Migration workflow | `references/migrations.md` |

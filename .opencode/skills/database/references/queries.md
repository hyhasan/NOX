# Query Patterns

## Pagination
```ts
const page = Number(searchParams.get("page")) || 1;
const limit = Number(searchParams.get("limit")) || 12;
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
  prisma.product.findMany({ skip, take: limit, ... }),
  prisma.product.count({ where: ... }),
]);
```

## Aggregation
```ts
const stats = await prisma.order.aggregate({
  _sum: { total_amount: true },
  _count: true,
  where: { created_at: { gte: thirtyDaysAgo } },
});
```

## Upsert Pattern
```ts
await prisma.siteSetting.upsert({
  where: { key: "site_name" },
  update: { value: newValue },
  create: { key: "site_name", value: newValue, type: "string", group: "general" },
});
```

## Transaction
```ts
await prisma.$transaction([
  prisma.warehouseStock.update({ where: { id }, data: { quantity: { decrement: qty } } }),
  prisma.inventoryLog.create({ data: { product_id, change_type: "order_placed", ... } }),
]);
```

## Search (Full Text)
```ts
const products = await prisma.product.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
    ],
  },
});
```

## Soft Delete / Status Filter
```ts
// Products use status field instead of deletion
const active = await prisma.product.findMany({
  where: { status: { not: "archived" } },
});
```

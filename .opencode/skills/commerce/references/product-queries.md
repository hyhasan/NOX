# Product Query Patterns

## Basic Product List
```ts
const products = await prisma.product.findMany({
  where: { status: "active" },
  include: {
    media: { where: { is_primary: true }, include: { media: true } },
    category: true,
    brand: true,
  },
  orderBy: { created_at: "desc" },
  take: limit,
  skip: offset,
});
```

## Filtered Query
```ts
const filters: Prisma.ProductWhereInput = {};
if (categorySlug) filters.category = { slug: categorySlug };
if (brandSlug) filters.brand = { slug: brandSlug };
if (minPrice) filters.price = { gte: minPrice };
if (maxPrice) filters.price = { ...filters.price, lte: maxPrice };
if (search) filters.name = { contains: search, mode: "insensitive" };
```

## Single Product
```ts
const product = await prisma.product.findUnique({
  where: { slug },
  include: {
    media: { include: { media: true }, orderBy: { sort_order: "asc" } },
    variants: { where: { is_active: true }, include: { option_values: { include: { option_value: true } } } },
    options: { include: { values: { orderBy: { sort_order: "asc" } } }, orderBy: { sort_order: "asc" } },
    attributes: { orderBy: { sort_order: "asc" } },
    reviews: { where: { is_approved: true }, include: { customer: true }, take: 10 },
    category: true,
    brand: true,
    tags: { include: { tag: true } },
  },
});
```

## Serialization
```ts
import { serializeProduct } from "@/lib/serialize";
return NextResponse.json({ data: products.map(serializeProduct) });
```

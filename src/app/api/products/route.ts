import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const categoryId = searchParams.get("category_id");
  const search = searchParams.get("search");

  const where: any = {};
  if (status) where.status = status;
  if (categoryId) where.category_id = categoryId;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const products = await prisma.product.findMany({
    where,
    include: { media: { include: { media: true }, orderBy: { sort_order: "asc" } }, category: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug || slugify(body.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        short_description: body.short_description || null,
        price: parseFloat(body.price),
        compare_price: body.compare_price ? parseFloat(body.compare_price) : null,
        cost: body.cost ? parseFloat(body.cost) : null,
        stock_quantity: parseInt(body.stock_quantity) || 0,
        sku: body.sku || null,
        barcode: body.barcode || null,
        category_id: body.category_id || null,
        brand_id: body.brand_id || null,
        status: body.status || "draft",
        is_featured: body.is_featured === true,
        is_taxable: body.is_taxable !== false,
        weight: body.weight ? parseFloat(body.weight) : null,
        min_order_qty: parseInt(body.min_order_qty) || 1,
      },
      include: { media: { include: { media: true } }, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

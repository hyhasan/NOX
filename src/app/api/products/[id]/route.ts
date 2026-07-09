import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { media: { include: { media: true }, orderBy: { sort_order: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.slug) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description;
    if (body.price) data.price = parseFloat(body.price);
    if (body.compare_price !== undefined) data.compare_price = body.compare_price ? parseFloat(body.compare_price) : null;
    if (body.cost !== undefined) data.cost = body.cost ? parseFloat(body.cost) : null;
    if (body.stock_quantity !== undefined) data.stock_quantity = parseInt(body.stock_quantity);
    if (body.sku !== undefined) data.sku = body.sku;
    if (body.category_id !== undefined) data.category_id = body.category_id;
    if (body.status) data.status = body.status;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { media: { include: { media: true } }, category: true },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

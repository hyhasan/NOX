import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/serialize";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { usages: true } } },
    });
    if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: serializeCoupon(coupon) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.code !== undefined) data.code = body.code.toUpperCase();
    if (body.description !== undefined) data.description = body.description;
    if (body.discount_type !== undefined) data.discount_type = body.discount_type;
    if (body.discount_value !== undefined) data.discount_value = parseFloat(body.discount_value);
    if (body.min_order_amount !== undefined) data.min_order_amount = body.min_order_amount ? parseFloat(body.min_order_amount) : null;
    if (body.max_discount !== undefined) data.max_discount = body.max_discount ? parseFloat(body.max_discount) : null;
    if (body.is_active !== undefined) data.is_active = body.is_active;
    if (body.usage_limit !== undefined) data.usage_limit = body.usage_limit ? parseInt(body.usage_limit) : null;
    if (body.applies_to !== undefined) data.applies_to = body.applies_to;
    if (body.is_stackable !== undefined) data.is_stackable = body.is_stackable;
    if (body.starts_at !== undefined) data.starts_at = body.starts_at ? new Date(body.starts_at) : null;
    if (body.expires_at !== undefined) data.expires_at = body.expires_at ? new Date(body.expires_at) : null;

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
    });
    return NextResponse.json({ data: serializeCoupon(coupon) });
  } catch {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
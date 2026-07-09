import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/serialize";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: { _count: { select: { usages: true } } },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ data: coupons.map(serializeCoupon) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.code?.trim()) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }
    if (!body.discount_type || !body.discount_value) {
      return NextResponse.json({ error: "Discount type and value are required" }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: body.code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        description: body.description || null,
        discount_type: body.discount_type,
        discount_value: parseFloat(body.discount_value),
        min_order_amount: body.min_order_amount ? parseFloat(body.min_order_amount) : null,
        max_discount: body.max_discount ? parseFloat(body.max_discount) : null,
        is_active: body.is_active !== false,
        usage_limit: body.usage_limit ? parseInt(body.usage_limit) : null,
        usage_limit_per_customer: body.usage_limit_per_customer ? parseInt(body.usage_limit_per_customer) : null,
        applies_to: body.applies_to || "all",
        is_stackable: body.is_stackable === true,
        starts_at: body.starts_at ? new Date(body.starts_at) : null,
        expires_at: body.expires_at ? new Date(body.expires_at) : null,
      },
    });
    return NextResponse.json({ data: serializeCoupon(coupon) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
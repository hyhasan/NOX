import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const totalStr = searchParams.get("total");

    if (!code) {
      return NextResponse.json({ valid: false, error: "Coupon code is required" });
    }

    const total = totalStr ? parseFloat(totalStr) : 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" });
    }

    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon is not yet active" });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
    }

    if (coupon.min_order_amount && total < Number(coupon.min_order_amount)) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is $${Number(coupon.min_order_amount).toFixed(2)}`,
      });
    }

    let discount = 0;
    let message = "";

    if (coupon.discount_type === "percentage") {
      discount = Math.round(total * (Number(coupon.discount_value) / 100) * 100) / 100;
      if (coupon.max_discount && discount > Number(coupon.max_discount)) {
        discount = Number(coupon.max_discount);
      }
      message = `${coupon.discount_value}% off`;
    } else if (coupon.discount_type === "fixed_amount") {
      discount = Math.min(Number(coupon.discount_value), total);
      message = `$${Number(coupon.discount_value).toFixed(2)} off`;
    } else if (coupon.discount_type === "free_shipping") {
      message = "Free shipping applied";
    }

    return NextResponse.json({
      valid: true,
      discount,
      code: coupon.code,
      message,
      description: coupon.description,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}

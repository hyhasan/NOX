import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NOX-${timestamp}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const email = searchParams.get("email");

    const where: Record<string, unknown> = {};
    if (status) where.order_status = status;
    if (email) where.customer_email = { contains: email, mode: "insensitive" };

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const total = parseFloat(body.total_amount);
    if (isNaN(total) || total <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    if (!body.name?.trim() || !body.email?.trim() || !body.address?.trim()) {
      return NextResponse.json({ error: "Name, email, and address are required" }, { status: 400 });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = body.items.map((i: Record<string, unknown>) => i.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
      }
      if (product.stock_quantity !== null && item.quantity > product.stock_quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`,
        }, { status: 400 });
      }
    }

    const couponDiscount = body.coupon_code
      ? await validateAndApplyCoupon(body.coupon_code, total)
      : 0;

    const shippingCost = total >= 50 ? 0 : 9.99;
    const taxRate = 0.08;
    const taxAmount = Math.round((total - couponDiscount) * taxRate * 100) / 100;
    const finalTotal = Math.round((total - couponDiscount + shippingCost + taxAmount) * 100) / 100;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of body.items) {
        const product = productMap.get(item.product_id);
        if (product && product.stock_quantity !== null && product.track_inventory !== false) {
          await tx.product.update({
            where: { id: item.product_id },
            data: { stock_quantity: { decrement: item.quantity } },
          });
          await tx.inventoryLog.create({
            data: {
              product_id: item.product_id,
              change_type: "order_placed",
              quantity_change: -item.quantity,
              quantity_before: product.stock_quantity,
              quantity_after: product.stock_quantity - item.quantity,
              reference_type: "order",
              created_by: "system",
            },
          });
        }
      }

      if (body.coupon_code && couponDiscount > 0) {
        await tx.coupon.update({
          where: { code: body.coupon_code },
          data: { used_count: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          order_number: generateOrderNumber(),
          customer_name: body.name,
          customer_email: body.email,
          customer_phone: body.phone || null,
          subtotal: total,
          discount_amount: couponDiscount,
          coupon_code: body.coupon_code || null,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total_amount: finalTotal,
          shipping_address_snapshot: body.address || null,
          payment_method: body.payment_method || "COD",
          order_status: "pending",
          shipping_status: "not_shipped",
          items: {
            create: body.items.map((item: Record<string, unknown>) => ({
              product_id: item.product_id,
              product_name_snapshot: item.product_name_snapshot as string,
              product_sku_snapshot: (item.product_sku_snapshot as string) || null,
              price_snapshot: parseFloat(item.price_snapshot as string),
              quantity: item.quantity as number,
              total_snapshot: parseFloat(item.price_snapshot as string) * (item.quantity as number),
              tax_snapshot: Math.round(parseFloat(item.price_snapshot as string) * (item.quantity as number) * taxRate * 100) / 100,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

async function validateAndApplyCoupon(code: string, total: number): Promise<number> {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.is_active) return 0;
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return 0;
  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) return 0;
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return 0;
  if (coupon.min_order_amount && total < Number(coupon.min_order_amount)) return 0;

  if (coupon.discount_type === "percentage") {
    const discount = Math.round(total * (Number(coupon.discount_value) / 100) * 100) / 100;
    if (coupon.max_discount) return Math.min(discount, Number(coupon.max_discount));
    return discount;
  }
  if (coupon.discount_type === "fixed_amount") {
    return Math.min(Number(coupon.discount_value), total);
  }
  return 0;
}

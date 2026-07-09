import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serialize";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: serializeOrder(order) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.order_status) data.order_status = body.order_status;
    if (body.payment_status) data.payment_status = body.payment_status;
    if (body.paid_at) data.paid_at = new Date(body.paid_at);
    if (body.shipping_status) data.shipping_status = body.shipping_status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.admin_notes !== undefined) data.admin_notes = body.admin_notes;

    if (body.order_status) {
      await prisma.orderStatusHistory.create({
        data: {
          order_id: id,
          to_status: body.order_status,
          changed_by: body.changed_by || "customer",
          note: body.status_note || null,
        },
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });
    return NextResponse.json({ data: serializeOrder(order) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.order.update({
      where: { id },
      data: { order_status: "cancelled" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}

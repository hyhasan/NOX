import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.subtitle !== undefined) data.subtitle = body.subtitle;
    if (body.image_url !== undefined) data.image_url = body.image_url;
    if (body.image_id !== undefined) data.image_id = body.image_id;
    if (body.mobile_image_id !== undefined) data.mobile_image_id = body.mobile_image_id;
    if (body.link_url !== undefined) data.link_url = body.link_url;
    if (body.link_text !== undefined) data.link_text = body.link_text;
    if (body.position !== undefined) data.position = body.position;
    if (body.is_active !== undefined) data.is_active = body.is_active;
    if (body.sort_order !== undefined) data.sort_order = body.sort_order;
    if (body.bg_color !== undefined) data.bg_color = body.bg_color;
    if (body.text_color !== undefined) data.text_color = body.text_color;
    const banner = await prisma.banner.update({
      where: { id },
      data,
      include: { image: true, mobile_image: true },
    });
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}

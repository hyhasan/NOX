import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { sort_order: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: any = {
      title: body.title || null,
      subtitle: body.subtitle || null,
      link_url: body.link_url || null,
      link_text: body.link_text || null,
      position: body.position || "hero",
      is_active: body.is_active !== false,
      sort_order: body.sort_order || 0,
      bg_color: body.bg_color || null,
      text_color: body.text_color || null,
    };
    if (body.image_id) data.image_id = body.image_id;
    if (body.mobile_image_id) data.mobile_image_id = body.mobile_image_id;
    const banner = await prisma.banner.create({
      data,
      include: { image: true, mobile_image: true },
    });
    return NextResponse.json(banner, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}

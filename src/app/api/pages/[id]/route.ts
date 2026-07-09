import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const page = await prisma.page.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        content_html: body.content_html,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        og_image: body.og_image,
        is_published: body.is_published,
      },
    });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}

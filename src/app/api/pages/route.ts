import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({ orderBy: { created_at: "desc" } });
    return NextResponse.json({ data: pages });
  } catch {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug || slugify(body.title);
    const page = await prisma.page.create({
      data: {
        title: body.title,
        slug,
        content_html: body.content_html || null,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        og_image: body.og_image || null,
        is_published: body.is_published || false,
      },
    });
    return NextResponse.json(page, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug || slugify(body.name);
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        parent_id: body.parent_id || null,
        icon: body.icon || null,
        sort_order: body.sort_order || 0,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

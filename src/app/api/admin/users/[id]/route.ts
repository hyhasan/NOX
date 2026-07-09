import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getTokenFromRequest, verifyToken } from "@/lib/auth";

async function getAdminFromToken(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.admin.findUnique({ where: { id: payload.id } });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const current = await getAdminFromToken(request);
    if (!current || current.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();

    if (id === current.id && body.is_active === false) {
      return NextResponse.json({ error: "You cannot deactivate yourself" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.username !== undefined) data.username = body.username;
    if (body.display_name !== undefined) data.display_name = body.display_name;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role;
    if (body.is_active !== undefined) data.is_active = body.is_active;
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      data.password_hash = await hashPassword(body.password);
    }

    const admin = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true, username: true, display_name: true, email: true,
        role: true, is_active: true, last_login_at: true, created_at: true,
      },
    });
    return NextResponse.json({ data: admin });
  } catch {
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const current = await getAdminFromToken(request);
    if (!current || current.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    if (id === current.id) {
      return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }
    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
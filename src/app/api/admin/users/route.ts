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

export async function GET(request: NextRequest) {
  try {
    const current = await getAdminFromToken(request);
    if (!current || current.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const admins = await prisma.admin.findMany({
      select: {
        id: true, username: true, display_name: true, email: true,
        role: true, is_active: true, last_login_at: true, created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ data: admins });
  } catch {
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const current = await getAdminFromToken(request);
    if (!current || current.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    if (!body.username?.trim() || !body.password?.trim()) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const existing = await prisma.admin.findUnique({ where: { username: body.username } });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }
    const admin = await prisma.admin.create({
      data: {
        username: body.username,
        password_hash: await hashPassword(body.password),
        display_name: body.display_name || null,
        email: body.email || null,
        role: body.role || "admin",
        is_active: body.is_active !== false,
      },
      select: {
        id: true, username: true, display_name: true, email: true,
        role: true, is_active: true, created_at: true,
      },
    });
    return NextResponse.json({ data: admin }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
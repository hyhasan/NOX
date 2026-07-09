import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword, verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { currentPassword, newPassword, newUsername } = await request.json();
    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (currentPassword) {
      const valid = await comparePassword(currentPassword, admin.password_hash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const data: any = {};
    if (newUsername) data.username = newUsername;
    if (newPassword) data.password_hash = await hashPassword(newPassword);

    const updated = await prisma.admin.update({
      where: { id: payload.id },
      data,
    });

    return NextResponse.json({ username: updated.username });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

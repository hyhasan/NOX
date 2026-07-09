import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/health-check";

export async function GET() {
  const status = getHealthStatus();
  return NextResponse.json({
    status: status.failoverActive ? "degraded" : "healthy",
    database: status.failoverActive ? "supabase_backup" : "primary",
    failoverActive: status.failoverActive,
    lastChecked: status.lastChecked,
  });
}

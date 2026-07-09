import { prisma } from "./prisma";

interface HealthStatus {
  primary: boolean;
  backup: boolean;
  activeUrl: string;
  failoverActive: boolean;
  lastChecked: Date;
}

const healthStatus: HealthStatus = {
  primary: true,
  backup: false,
  activeUrl: process.env.DATABASE_URL || "",
  failoverActive: false,
  lastChecked: new Date(),
};

let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3;
const CHECK_INTERVAL = 30000;

const currentDbUrl = process.env.DATABASE_URL || "";
const supabaseUrl = process.env.SUPABASE_URL
  ? process.env.DATABASE_URL?.replace(/\/\/[^@]+@/, `//postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@`)
  : null;

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    consecutiveFailures = 0;
    if (healthStatus.failoverActive) {
      healthStatus.failoverActive = false;
      healthStatus.activeUrl = currentDbUrl;
    }
    healthStatus.primary = true;
    healthStatus.lastChecked = new Date();
    return true;
  } catch {
    consecutiveFailures++;
    healthStatus.lastChecked = new Date();
    if (consecutiveFailures >= FAILURE_THRESHOLD) {
      await triggerFailover();
    }
    return false;
  }
}

async function triggerFailover(): Promise<void> {
  if (supabaseUrl && !healthStatus.failoverActive) {
    healthStatus.failoverActive = true;
    healthStatus.primary = false;
    healthStatus.backup = true;
    healthStatus.activeUrl = supabaseUrl;
    console.warn("[HEALTH CHECK] Failover triggered! Switching to Supabase backup.");
  }
}

export function getHealthStatus(): HealthStatus {
  return { ...healthStatus };
}

export function resetFailover(): void {
  consecutiveFailures = 0;
  healthStatus.failoverActive = false;
  healthStatus.primary = true;
  healthStatus.backup = false;
  healthStatus.activeUrl = currentDbUrl;
}

if (typeof setInterval !== "undefined") {
  setInterval(checkDatabaseHealth, CHECK_INTERVAL);
}

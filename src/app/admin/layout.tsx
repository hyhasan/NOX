"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { usePathname } from "next/navigation";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <AdminLayout key={pathname}>{children}</AdminLayout>;
}
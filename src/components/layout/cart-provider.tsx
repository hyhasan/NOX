"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const loadFromStorage = useCartStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return <>{children}</>;
}

"use client";

import { useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CategoryOption {
  id: string;
  name: string;
}

interface FilterValues {
  search: string;
  category: string;
  sort: string;
  page: string;
}

export function ProductFilters({
  categories, current,
}: {
  categories: CategoryOption[];
  current: FilterValues;
}) {
  const navigate = useCallback((updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { ...current, ...updates };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    window.location.href = `/products?${sp.toString()}`;
  }, [current]);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form method="GET" action="/products" className="flex w-full max-w-xs gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" />
          <Input
            name="search"
            placeholder="Search products..."
            defaultValue={current.search || ""}
            className="pl-9"
          />
        </div>
        <button type="submit" className="sr-only">Search</button>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          name="category"
          onChange={(e) => navigate({ category: e.target.value || undefined, page: undefined })}
          className="h-10 cursor-pointer rounded-lg border bg-background px-3 text-sm text-foreground"
          defaultValue={current.category || ""}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          name="sort"
          onChange={(e) => navigate({ sort: e.target.value || undefined, page: undefined })}
          className="h-10 cursor-pointer rounded-lg border bg-background px-3 text-sm text-foreground"
          defaultValue={current.sort || ""}
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}

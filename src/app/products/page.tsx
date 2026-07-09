import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";
import { serializeProduct } from "@/lib/serialize";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductFilters } from "./product-filters";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 12;

async function getProducts(searchParams: { [key: string]: string | undefined }) {
  const where: Record<string, unknown> = { status: "active" };

  if (searchParams.search) {
    where.name = { contains: searchParams.search, mode: "insensitive" };
  }
  if (searchParams.category) {
    where.category_id = searchParams.category;
  }

  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const skip = (page - 1) * PRODUCTS_PER_PAGE;

  try {
    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { media: { include: { media: true }, orderBy: { sort_order: "asc" } }, category: true },
        orderBy: searchParams.sort === "price_asc"
          ? { price: "asc" }
          : searchParams.sort === "price_desc"
          ? { price: "desc" }
          : { created_at: "desc" },
        skip,
        take: PRODUCTS_PER_PAGE,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    return {
      products: products.map(serializeProduct),
      categories,
      total,
      page,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    };
  } catch {
    return { products: [], categories: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { products, categories, total, page, totalPages } = await getProducts(params);

  function buildUrl(updates: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { ...params, ...updates };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/products?${sp.toString()}`;
  }

  return (
    <div className="container-site py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Products</h1>
        <p className="mt-1 text-sm text-secondary/60">{total} products found</p>
      </div>

      <ProductFilters
        categories={categories}
        current={{ search: params.search || "", category: params.category || "", sort: params.sort || "", page: params.page || "" }}
      />

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-neutral-500">No products found.</p>
          <p className="mt-1 text-sm text-neutral-400">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-sm text-secondary/60 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-accent text-white"
                      : "border border-border/50 text-secondary/60 hover:bg-muted"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-sm text-secondary/60 hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

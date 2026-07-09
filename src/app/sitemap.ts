import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  let productRoutes: any[] = [];
  let pageRoutes: any[] = [];

  try {
    const [products, pages] = await Promise.all([
      prisma.product.findMany({
        where: { status: "active" },
        select: { slug: true, created_at: true },
      }),
      prisma.page.findMany({
        where: { is_published: true },
        select: { slug: true, created_at: true },
      }),
    ]);

    productRoutes = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    pageRoutes = pages.map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Database unavailable, serve static routes only
  }

  return [...staticRoutes, ...productRoutes, ...pageRoutes];
}

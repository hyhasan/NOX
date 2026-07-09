import { prisma } from "@/lib/prisma";
import { BannerHero } from "@/components/storefront/banner-hero";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { serializeProduct } from "@/lib/serialize";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [banners, featured, latest] = await Promise.all([
      prisma.banner.findMany({ include: { image: true, mobile_image: true }, orderBy: { sort_order: "asc" } }),
      prisma.product.findMany({
        where: { status: "active", is_featured: true },
        include: { media: { include: { media: true }, orderBy: { sort_order: "asc" } }, category: true },
        take: 4,
        orderBy: { created_at: "desc" },
      }),
      prisma.product.findMany({
        where: { status: "active" },
        include: { media: { include: { media: true }, orderBy: { sort_order: "asc" } }, category: true },
        take: 8,
        orderBy: { created_at: "desc" },
      }),
    ]);

    return {
      banners,
      featuredProducts: featured.map(serializeProduct),
      latestProducts: latest.map(serializeProduct),
    };
  } catch {
    return { banners: [], featuredProducts: [], latestProducts: [] };
  }
}

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Sparkles, title: "Premium Quality", desc: "Curated selections" },
];

export default async function HomePage() {
  const { banners, featuredProducts, latestProducts } = await getData();

  return (
    <>
      <BannerHero banners={banners} />

      <section className="container-site py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Badge variant="outline" className="mb-3 text-accent border-accent/30 bg-accent/5">
              Featured
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">Featured Products</h2>
            <p className="mt-2 text-secondary/60">Handpicked just for you</p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 cursor-pointer">
            <Link href="/products">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="container-site">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <Badge variant="outline" className="mb-3 text-accent border-accent/30 bg-accent/5">
                New Arrivals
              </Badge>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">Latest Arrivals</h2>
              <p className="mt-2 text-secondary/60">The newest products in our collection</p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 cursor-pointer">
              <Link href="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-site py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="feature-card rounded-xl p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <feat.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{feat.title}</h3>
              <p className="mt-1 text-sm text-secondary/60">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/20" />
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 blur-3xl" />
        <div className="container-site relative text-center">
          <Badge variant="outline" className="mb-4 border-white/20 text-white/80 bg-white/5">
            Free Shipping
          </Badge>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Free Shipping on Orders Over $50
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            Plus easy returns within 30 days. No questions asked.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-accent text-white hover:bg-accent/90 cursor-pointer"
            asChild
          >
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

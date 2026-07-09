"use client";

import Link from "next/link";
import type { Banner } from "@/types";

interface BannerHeroProps {
  banners: Banner[];
}

export function BannerHero({ banners }: BannerHeroProps) {
  const activeBanners = banners.filter((b) => b.is_active && b.position === "hero");

  if (activeBanners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-accent/20 py-24 text-white">
        <div className="absolute top-0 right-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 blur-3xl" />
        <div className="container-site relative text-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-white/80 mb-6">
            Premium E-Commerce
          </span>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to NOX
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/60">
            Discover curated products that define your style.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-accent/90 cursor-pointer"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {activeBanners.slice(0, 1).map((banner) => (
        <div key={banner.id} className="relative h-[450px] sm:h-[550px] lg:h-[650px]">
          <img
            src={banner.image?.url || ""}
            alt={banner.image?.alt_text || banner.title || ""}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container-site">
              {banner.title && (
                <h1 className="max-w-xl font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {banner.title}
                </h1>
              )}
              {banner.subtitle && (
                <p className="mt-2 max-w-lg text-white/70">{banner.subtitle}</p>
              )}
              {banner.link_url && (
                <Link
                  href={banner.link_url}
                  className="mt-6 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-accent/90 cursor-pointer"
                >
                  {banner.link_text || "Shop Now"}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

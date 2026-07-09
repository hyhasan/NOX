import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="container-site py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl font-bold text-primary sm:text-5xl">About NOX</h1>
        <p className="mt-4 text-lg text-secondary/60 leading-relaxed">
          We believe in the power of curated simplicity. Every product at NOX is chosen for its quality,
          design, and lasting value.
        </p>
      </div>

      <div className="mx-auto mt-16 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-primary">Our Story</h2>
          <div className="space-y-4 text-secondary/70 leading-relaxed">
            <p>
              Founded with a vision to redefine online shopping, NOX brings together the finest products
              from around the world. We partner with artisans, designers, and manufacturers who share our
              commitment to quality and sustainability.
            </p>
            <p>
              Every item in our collection is carefully vetted, ensuring that when you shop with us,
              you&apos;re getting the best. From timeless essentials to statement pieces, we curate
              products that elevate everyday living.
            </p>
            <p>
              Our team works tirelessly to ensure a seamless shopping experience — from browsing to
              delivery. We believe that great design should be accessible to everyone, and we&apos;re
              here to make that happen.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-primary">Our Values</h2>
          <div className="space-y-4">
            {[
              { icon: Sparkles, title: "Quality First", desc: "We never compromise on quality. Every product meets our rigorous standards before it reaches your doorstep." },
              { icon: ShieldCheck, title: "Trust & Transparency", desc: "Clear pricing, honest descriptions, and hassle-free returns. Shopping with NOX means shopping with confidence." },
              { icon: Truck, title: "Fast & Free Shipping", desc: "Free shipping on orders over $50. We partner with reliable carriers to get your order to you as quickly as possible." },
              { icon: RefreshCw, title: "Easy Returns", desc: "Not satisfied? We offer 30-day hassle-free returns. Your satisfaction is our top priority." },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="feature-card rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">{value.title}</h3>
                      <p className="mt-1 text-sm text-secondary/60">{value.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl text-center">
        <div className="feature-card rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 p-8 sm:p-12">
          <h2 className="font-heading text-2xl font-bold text-primary">Have a Question?</h2>
          <p className="mt-2 text-secondary/60">
            We&apos;d love to hear from you. Reach out to our team and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

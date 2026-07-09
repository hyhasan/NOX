"use client";

import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const { toast } = useToast();
  const primaryMedia = product.media?.find((m) => m.is_primary) || product.media?.[0];

  const inCart = items.find((i) => i.product_id === product.id);
  const outOfStock = Number(product.stock_quantity) <= 0;

  const discount = product.compare_price && Number(product.compare_price) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100) : 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: primaryMedia?.media.url || "",
      quantity: 1,
      slug: product.slug,
      sku: product.sku || undefined,
    });
    toast({
      type: "success",
      title: "Added to cart",
      message: `${product.name} has been added.`,
    });
  }

  return (
    <div className="group relative feature-card rounded-xl p-3">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {primaryMedia ? (
            <img
              src={primaryMedia.media.url}
              alt={primaryMedia.media.alt_text || product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-secondary/40 text-xs">
              No Image
            </div>
          )}
          {discount > 0 && (
            <Badge variant="danger" className="absolute left-2 top-2 text-[10px]">
              {discount}% OFF
            </Badge>
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-1.5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-primary/90 transition-colors duration-200 group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <p className="text-xs text-secondary/50">{product.category.name}</p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">{formatPrice(Number(product.price))}</span>
          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
            <span className="text-xs text-secondary/40 line-through">
              {formatPrice(Number(product.compare_price))}
            </span>
          )}
        </div>

        {outOfStock ? (
          <Button size="sm" className="mt-2 w-full" disabled>
            Out of Stock
          </Button>
        ) : inCart ? (
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 cursor-pointer" disabled>
              <Check className="mr-1 h-3 w-3" /> In Cart
            </Button>
            <Button size="sm" className="flex-1 cursor-pointer" onClick={handleAdd}>
              + Add More
            </Button>
          </div>
        ) : (
          <Button size="sm" className="mt-2 w-full cursor-pointer" onClick={handleAdd}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}

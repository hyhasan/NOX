"use client";

import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/types";

interface Props {
  product: Product;
  imageUrl: string;
  stockQuantity: number;
}

export function AddToCartButton({ product, imageUrl, stockQuantity }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const { toast } = useToast();

  const inCart = items.find((i) => i.product_id === product.id);
  const cartQty = inCart?.quantity || 0;
  const maxQty = stockQuantity;
  const canAddMore = maxQty > cartQty;
  const outOfStock = stockQuantity <= 0;

  function handleAdd() {
    if (outOfStock || !canAddMore) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: imageUrl,
      quantity: 1,
      slug: product.slug,
      sku: product.sku || undefined,
    });
    toast({
      type: "success",
      title: "Added to cart",
      message: `${product.name} has been added to your cart.`,
    });
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="w-full cursor-pointer"
        disabled={outOfStock || !canAddMore}
        onClick={handleAdd}
      >
        {outOfStock ? (
          "Out of Stock"
        ) : !canAddMore ? (
          <span className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            In Cart ({cartQty})
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add to Cart {inCart ? `(${cartQty} in cart)` : ""}
          </span>
        )}
      </Button>
      {inCart && canAddMore && (
        <p className="text-center text-xs text-secondary/50">
          {cartQty} in cart &middot; {maxQty - cartQty} more available
        </p>
      )}
    </div>
  );
}

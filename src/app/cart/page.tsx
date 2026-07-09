"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const subtotal = getTotal();
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const effectiveSubtotal = subtotal - couponDiscount;
  const taxAmount = effectiveSubtotal > 0 ? Math.round(effectiveSubtotal * 0.08 * 100) / 100 : 0;
  const finalTotal = Math.round((effectiveSubtotal + shipping + taxAmount) * 100) / 100;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode)}&total=${subtotal}`);
      const data = await res.json();
      if (data.valid && data.discount > 0) {
        setCouponDiscount(data.discount);
        setAppliedCoupon(couponCode);
        setCouponCode("");
        toast({ type: "success", title: "Coupon applied!", message: data.message });
      } else {
        setCouponDiscount(0);
        setCouponError(data.error || "Invalid coupon");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon("");
    setCouponDiscount(0);
    setCouponError("");
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-24 text-center">
        <ShoppingBag className="mx-auto h-20 w-20 text-secondary/20" />
        <h1 className="mt-6 font-heading text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mx-auto mt-2 max-w-sm text-secondary/60">
          Looks like you haven&apos;t added anything yet. Browse our collection to find something you love.
        </p>
        <Button className="mt-8 cursor-pointer" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="mb-8 font-heading text-2xl font-bold sm:text-3xl">
        Shopping Cart
        <span className="ml-2 text-base font-normal text-secondary/50">({getItemCount()} items)</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.product_id} className="feature-card !bg-background border-border/50">
              <CardContent className="flex gap-4 p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-secondary/30">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium text-primary transition-colors hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-secondary/50">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium text-primary">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-primary">{formatPrice(item.price * item.quantity)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => {
                          removeItem(item.product_id);
                          toast({ type: "info", title: "Removed", message: `${item.name} removed from cart.` });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="feature-card !bg-background border-border/50">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 p-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-accent" />
                      <span className="font-medium text-accent">{appliedCoupon}</span>
                      <Badge variant="success" className="text-[10px]">-{formatPrice(couponDiscount)}</Badge>
                    </div>
                    <button type="button" onClick={removeCoupon} className="cursor-pointer text-xs text-destructive/70 hover:text-destructive">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="shrink-0 cursor-pointer"
                    >
                      {couponLoading ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                      ) : (
                        <Percent className="h-3 w-3" />
                      )}
                      <span className="ml-1.5">Apply</span>
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
              </div>

              <div className="space-y-2 border-t border-border/30 pt-4 text-sm">
                <div className="flex justify-between text-secondary/70">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span className="font-medium text-primary">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary/70">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "font-medium text-accent" : "text-primary"}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-secondary/40">
                    Free shipping on orders over {formatPrice(50)}
                  </p>
                )}
                <div className="flex justify-between text-secondary/70">
                  <span>Estimated Tax</span>
                  <span className="text-primary">{formatPrice(taxAmount)}</span>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <div className="flex justify-between font-heading text-lg font-bold text-primary">
                  <span>Total</span>
                  <span className="text-accent">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button className="w-full cursor-pointer" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="outline" className="w-full cursor-pointer" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

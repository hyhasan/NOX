"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CheckCircle, Package, Truck, CreditCard, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = use(searchParams);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.order) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    fetch(`/api/orders?search=${encodeURIComponent(params.order)}`)
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data.data) ? data.data[0] : data;
        setOrder(found || null);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.order]);

  if (loading) {
    return (
      <div className="container-site py-24 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="mt-4 text-secondary/60">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-site py-24 text-center">
        <Package className="mx-auto h-20 w-20 text-secondary/20" />
        <h1 className="mt-6 font-heading text-3xl font-bold">Order Not Found</h1>
        <p className="mt-2 text-secondary/60 max-w-md mx-auto">
          We couldn&apos;t find this order. It may have been placed from a different device or session.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "confirmed": return "default";
      case "processing": return "default";
      case "shipped": return "default";
      case "delivered": return "success";
      case "cancelled": return "danger";
      default: return "secondary" as const;
    }
  };

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold text-primary">Order Confirmed!</h1>
        <p className="mt-2 text-secondary/60">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-6">
        <Card className="feature-card !bg-background border-accent/20">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-secondary/50 uppercase tracking-wide">Order Number</p>
                <p className="text-lg font-bold text-primary font-mono">{order.order_number}</p>
              </div>
              <Badge variant={getStatusColor(order.order_status)} className="capitalize">
                {order.order_status}
              </Badge>
              <div className="text-right">
                <p className="text-xs text-secondary/50 uppercase tracking-wide">Order Date</p>
                <p className="text-sm font-medium text-primary">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="feature-card !bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-primary">{item.product_name_snapshot}</p>
                  <p className="text-sm text-secondary/50">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-primary">{formatPrice(item.price_snapshot * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="feature-card !bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-accent" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-primary">{order.customer_name}</p>
              <p className="text-sm text-secondary/70">{order.customer_email}</p>
              {order.customer_phone && (
                <p className="text-sm text-secondary/70">{order.customer_phone}</p>
              )}
              {order.shipping_address_snapshot && (
                <div className="mt-2 rounded-lg bg-muted p-3 text-sm text-secondary/70">
                  {order.shipping_address_snapshot}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="feature-card !bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-accent" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary/70">Subtotal</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
              {order.shipping_address_snapshot && (
                <div className="flex justify-between">
                  <span className="text-secondary/70">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/30 pt-2 font-heading text-base font-bold">
                <span>Total</span>
                <span className="text-accent">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="mt-2 rounded-lg bg-muted p-3 text-xs text-secondary/50">
                <p className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3" />
                  Payment Method: <span className="capitalize font-medium text-primary">{order.payment_method}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="feature-card !bg-background border-accent/10 bg-accent/[0.02]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <Truck className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary">What&apos;s Next?</p>
                <p className="text-sm text-secondary/60">
                  You&apos;ll receive a confirmation email shortly. We&apos;ll notify you when your order ships.
                  You can track your order status anytime.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/order/tracking?id=${order.order_number}`}>
                  Track Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

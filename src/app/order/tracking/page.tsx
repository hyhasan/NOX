"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, XCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_FLOW: Record<string, { label: string; icon: typeof Package; steps: string[] }> = {
  pending: { label: "Order Placed", icon: Clock, steps: ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"] },
  confirmed: { label: "Confirmed", icon: Package, steps: ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"] },
  processing: { label: "Processing", icon: Package, steps: ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"] },
  shipped: { label: "In Transit", icon: Truck, steps: ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"] },
  delivered: { label: "Delivered", icon: CheckCircle, steps: ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"] },
  cancelled: { label: "Cancelled", icon: XCircle, steps: ["Placed", "Cancelled"] },
};

function getStepStatus(step: string, currentStatus: string): "done" | "current" | "pending" {
  const flow = STATUS_FLOW[currentStatus];
  if (!flow) return "pending";
  const idx = flow.steps.indexOf(step);
  const curIdx = flow.steps.indexOf(currentStatus === "cancelled" ? "Cancelled" :
    currentStatus === "pending" ? "Placed" :
    currentStatus === "confirmed" ? "Confirmed" :
    currentStatus === "processing" ? "Processing" :
    currentStatus === "shipped" ? "Shipped" : "Delivered");
  if (idx < curIdx) return "done";
  if (idx === curIdx) return "current";
  return "pending";
}

export default function OrderTrackingPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = use(searchParams);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchId, setSearchId] = useState(params.id || "");

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id);
    }
  }, [params.id]);

  async function fetchOrder(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(id)}`);
      const data = await res.json();
      const found = Array.isArray(data.data) ? data.data[0] : data;
      setOrder(found?.order_number ? found : null);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const flow = order ? STATUS_FLOW[order.order_status] || STATUS_FLOW.pending : null;
  const StepIcon = flow?.icon || Package;

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 font-heading text-3xl font-bold text-primary">Order Tracking</h1>
        <p className="mb-8 text-secondary/60">Enter your order number to track your delivery status.</p>

        <div className="mb-10 flex gap-3">
          <Input
            placeholder="Enter order number (e.g. NOX-LXZK8-A3F2)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrder(searchId)}
          />
          <Button onClick={() => fetchOrder(searchId)} disabled={loading || !searchId.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Track</span>
          </Button>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
            <p className="mt-3 text-sm text-secondary/60">Looking up your order...</p>
          </div>
        )}

        {searched && !loading && !order && (
          <Card className="feature-card !bg-background">
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-secondary/20" />
              <h2 className="mt-4 font-heading text-xl font-bold text-primary">Order Not Found</h2>
              <p className="mt-1 text-sm text-secondary/60">
                We couldn&apos;t find an order with that number. Please check and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {order && flow && (
          <div className="space-y-8">
            <Card className="feature-card !bg-background border-accent/20">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-secondary/50 uppercase tracking-wide">Order Number</p>
                    <p className="font-mono text-lg font-bold text-primary">{order.order_number}</p>
                  </div>
                  <Badge variant={order.order_status === "delivered" ? "success" : order.order_status === "cancelled" ? "danger" : "warning"} className="capitalize">
                    {order.order_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="feature-card !bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <StepIcon className="h-5 w-5 text-accent" />
                  {flow.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
                  <div className="space-y-6">
                    {flow.steps.map((step, i) => {
                      const stepStatus = getStepStatus(step, order.order_status);
                      return (
                        <div key={i} className="relative flex items-start gap-4 pl-12">
                          <div className={`absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 z-10 transition-all ${
                            stepStatus === "done" ? "border-accent bg-accent" :
                            stepStatus === "current" ? "border-accent bg-accent/10" :
                            "border-border bg-background"
                          }`}>
                            {stepStatus === "done" && <CheckCircle className="h-3 w-3 text-white" />}
                            {stepStatus === "current" && <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                          </div>
                          <div className="pt-0.5">
                            <p className={`text-sm font-medium ${
                              stepStatus === "done" ? "text-accent" :
                              stepStatus === "current" ? "text-primary" :
                              "text-secondary/40"
                            }`}>{step}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="feature-card !bg-background">
              <CardHeader>
                <CardTitle className="text-sm">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-secondary/70">{item.product_name_snapshot} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price_snapshot * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border/30 pt-3 font-heading font-bold">
                  <span>Total</span>
                  <span className="text-accent">{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button asChild><Link href="/products">Continue Shopping</Link></Button>
              <Button variant="outline" asChild><Link href="/">Back to Home</Link></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

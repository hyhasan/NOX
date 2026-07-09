"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const statusColors: Record<string, string> = {
  pending: "warning",
  confirmed: "default",
  shipped: "secondary",
  delivered: "success",
  cancelled: "danger",
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/orders");
    const json = await res.json();
    setOrders(json.data || json);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_status: status }),
    });
    if (!res.ok) { toast({ type: "error", title: "Update failed", message: "Could not update order status." }); return; }
    toast({ type: "success", title: "Status updated", message: `Order moved to "${status}".` });
    load();
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, order_status: status });
    }
  }

  const filtered = filter ? orders.filter((o) => o.order_status === filter) : orders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
              {s || "All"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-neutral-50">
                    <th className="px-4 py-3 text-left font-medium">Order</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Total</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-neutral-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="px-4 py-3 font-medium">{order.order_number}</td>
                      <td className="px-4 py-3">{order.customer_name}</td>
                      <td className="px-4 py-3">{formatPrice(Number(order.total_amount))}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[order.order_status] as any}>{order.order_status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <select
                          className="h-8 rounded border px-2 text-xs"
                          value={order.order_status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {selectedOrder && (
          <div>
            <Card>
              <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500">Order Number</p>
                  <p className="font-medium">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && <p className="text-sm text-neutral-500">{selectedOrder.customer_phone}</p>}
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Shipping Address</p>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Payment Method</p>
                  <p className="text-sm">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Status</p>
                  <Badge variant={statusColors[selectedOrder.order_status] as any}>{selectedOrder.order_status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Items</p>
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                      <span>{item.product_name_snapshot} x{item.quantity}</span>
                      <span>{formatPrice(Number(item.price_snapshot) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(Number(selectedOrder.total_amount))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

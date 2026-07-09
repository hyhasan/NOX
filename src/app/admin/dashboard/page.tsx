"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, Clock, AlertTriangle, PlusCircle, ListOrdered, UserCog, Tag } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCategories: number;
  recentOrders: any[];
  lowStockProducts: any[];
  ordersByStatus: { status: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes, categoriesRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (!ordersRes.ok || !productsRes.ok || !categoriesRes.ok) {
          setError("Failed to load dashboard data");
          return;
        }

        const ordersJson = await ordersRes.json();
        const productsJson = await productsRes.json();
        const categoriesJson = await categoriesRes.json();

        const orders = ordersJson.data || ordersJson;
        const products = productsJson.data || productsJson;
        const categories = categoriesJson.data || categoriesJson;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalSales = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
        const todaySales = orders
          .filter((o: any) => new Date(o.created_at) >= today)
          .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
        const pendingOrders = orders.filter((o: any) => o.order_status === "pending").length;
        const recentOrders = orders.slice(0, 5);
        const lowStockProducts = products.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= 5);

        const statusCounts = ["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => ({
          status,
          count: orders.filter((o: any) => o.order_status === status).length,
        }));

        setData({
          totalSales,
          todaySales,
          totalOrders: orders.length,
          pendingOrders,
          totalProducts: products.length,
          totalCategories: categories.length,
          recentOrders,
          lowStockProducts,
          ordersByStatus: statusCounts,
        });
      } catch {
        setError("Failed to connect to server");
      }
    }
    load();
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div className="text-neutral-500 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-500">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(data.totalSales)}</p>
            <p className="text-xs text-neutral-500 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-0.5" />
              {formatPrice(data.todaySales)} today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalOrders}</p>
            <p className="text-xs text-neutral-500 mt-1">
              <Clock className="inline h-3 w-3 mr-0.5" />
              {data.pendingOrders} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalProducts}</p>
            <p className="text-xs text-neutral-500 mt-1">
              <AlertTriangle className="inline h-3 w-3 mr-0.5" />
              {data.lowStockProducts.length} low stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalCategories}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{order.order_number}</span>
                      <p className="text-xs text-neutral-500">{order.customer_name || "Guest"}</p>
                    </div>
                    <span className="text-neutral-500">{formatPrice(Number(order.total_amount))}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      order.order_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      order.order_status === "confirmed" ? "bg-blue-100 text-blue-800" :
                      order.order_status === "shipped" ? "bg-purple-100 text-purple-800" :
                      order.order_status === "delivered" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{item.status}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              {data.lowStockProducts.length === 0 ? (
                <p className="text-sm text-green-600">All products are well-stocked.</p>
              ) : (
                <div className="space-y-2">
                  {data.lowStockProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between text-sm">
                      <span>{product.name}</span>
                      <span className="text-red-600 font-medium">{product.stock_quantity} left</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/products?action=new" className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm font-medium hover:bg-neutral-50 transition-colors">
            <PlusCircle className="h-5 w-5 text-blue-500" />
            Create Product
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm font-medium hover:bg-neutral-50 transition-colors">
            <ListOrdered className="h-5 w-5 text-purple-500" />
            View All Orders
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm font-medium hover:bg-neutral-50 transition-colors">
            <UserCog className="h-5 w-5 text-green-500" />
            Manage Admins
          </Link>
          <Link href="/admin/coupons" className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm font-medium hover:bg-neutral-50 transition-colors">
            <Tag className="h-5 w-5 text-amber-500" />
            Manage Coupons
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

interface DashboardData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function load() {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      const orders = await ordersRes.json();
      const products = await productsRes.json();
      const categories = await categoriesRes.json();

      const totalSales = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
      const recentOrders = orders.slice(0, 5);
      const lowStockProducts = products.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= 5);

      setData({
        totalSales,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCategories: categories.length,
        recentOrders,
        lowStockProducts,
      });
    }
    load();
  }, []);

  if (!data) return <div className="text-neutral-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${Number(data.totalSales).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalProducts}</p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
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
                    <span className="font-medium">{order.order_number}</span>
                    <span className="text-neutral-500">${Number(order.total_amount).toFixed(2)}</span>
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

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-green-600">All products are well-stocked.</p>
            ) : (
              <div className="space-y-3">
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
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  status: string;
  category?: { name: string } | null;
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: "", slug: "", description: "", price: "", compare_price: "",
    cost: "", stock_quantity: "0", sku: "", category_id: "", status: "draft",
  });

  useEffect(() => {
    loadProducts();
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  function editProduct(product: any) {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || "",
      cost: product.cost?.toString() || "",
      stock_quantity: product.stock_quantity.toString(),
      sku: product.sku || "",
      category_id: product.category_id || "",
      status: product.status,
    });
    setEditing(product.id);
    setShowForm(true);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast({ type: "error", title: "Name required" }); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { toast({ type: "error", title: "Valid price required" }); return; }

    const url = editing ? `/api/products/${editing}` : "/api/products";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ type: "error", title: "Save failed", message: data.error || "Please try again." });
        return;
      }
    } catch {
      toast({ type: "error", title: "Connection error", message: "Unable to reach the server." });
      return;
    }

    setShowForm(false);
    setEditing(null);
    setForm({ name: "", slug: "", description: "", price: "", compare_price: "", cost: "", stock_quantity: "0", sku: "", category_id: "", status: "draft" });
    toast({ type: "success", title: editing ? "Product updated" : "Product created", message: `"${form.name}" has been saved.` });
    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ type: "success", title: "Product deleted" });
      loadProducts();
    } else {
      toast({ type: "error", title: "Delete failed", message: "The product could not be deleted." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", slug: "", description: "", price: "", compare_price: "", cost: "", stock_quantity: "0", sku: "", category_id: "", status: "draft" }); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Product" : "New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProduct} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Compare Price</Label>
                <Input type="number" step="0.01" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                  <th className="px-4 py-3 text-left font-medium">Stock</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={product.stock_quantity <= 5 ? "text-red-600 font-medium" : ""}>{product.stock_quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{product.category?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={product.status === "active" ? "success" : product.status === "draft" ? "warning" : "secondary"}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => editProduct(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

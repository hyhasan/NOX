"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
  applies_to: string;
  is_stackable: boolean;
  starts_at: string | null;
  expires_at: string | null;
  _count?: { usages: number };
}

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    code: "", description: "", discount_type: "percentage", discount_value: "",
    min_order_amount: "", max_discount: "", usage_limit: "",
    applies_to: "all", is_stackable: false, is_active: true,
    starts_at: "", expires_at: "",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch("/api/coupons");
      const json = await res.json();
      setCoupons(json.data || json);
    } catch {
      toast({ type: "error", title: "Failed to load coupons" });
    }
  }

  function editCoupon(c: Coupon) {
    setForm({
      code: c.code,
      description: c.description || "",
      discount_type: c.discount_type,
      discount_value: c.discount_value.toString(),
      min_order_amount: c.min_order_amount?.toString() || "",
      max_discount: c.max_discount?.toString() || "",
      usage_limit: c.usage_limit?.toString() || "",
      applies_to: c.applies_to,
      is_stackable: c.is_stackable,
      is_active: c.is_active,
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
    });
    setEditing(c.id);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) { toast({ type: "error", title: "Coupon code required" }); return; }
    if (!form.discount_value || isNaN(parseFloat(form.discount_value))) { toast({ type: "error", title: "Valid discount value required" }); return; }

    const url = editing ? `/api/coupons/${editing}` : "/api/coupons";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast({ type: "error", title: "Save failed", message: d.error || "Please try again." }); return; }
      toast({ type: "success", title: editing ? "Coupon updated" : "Coupon created" });
    } catch {
      toast({ type: "error", title: "Connection error" });
      return;
    }
    setShowForm(false);
    setEditing(null);
    setForm({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order_amount: "", max_discount: "", usage_limit: "", applies_to: "all", is_stackable: false, is_active: true, starts_at: "", expires_at: "" });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) { toast({ type: "error", title: "Delete failed" }); return; }
      toast({ type: "success", title: "Coupon deleted" });
    } catch {
      toast({ type: "error", title: "Connection error" });
      return;
    }
    load();
  }

  const discountLabel = (c: Coupon) => {
    if (c.discount_type === "percentage") return `${c.discount_value}%`;
    if (c.discount_type === "fixed_amount") return formatPrice(c.discount_value);
    return "Free Shipping";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order_amount: "", max_discount: "", usage_limit: "", applies_to: "all", is_stackable: false, is_active: true, starts_at: "", expires_at: "" }); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit Coupon" : "New Coupon"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="20% off summer sale" />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <select className="flex h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input type="number" step="0.01" required value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder={form.discount_type === "percentage" ? "20" : "10"} />
              </div>
              <div className="space-y-2">
                <Label>Min Order Amount</Label>
                <Input type="number" step="0.01" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label>Max Discount (for %)</Label>
                <Input type="number" step="0.01" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="25" />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label>Applies To</Label>
                <select className="flex h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value })}>
                  <option value="all">All Products</option>
                  <option value="specific_products">Specific Products</option>
                  <option value="specific_categories">Specific Categories</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Starts At</Label>
                <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_stackable} onChange={(e) => setForm({ ...form, is_stackable: e.target.checked })} />
                  <span className="text-sm">Stackable</span>
                </label>
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
                  <th className="px-4 py-3 text-left font-medium">Code</th>
                  <th className="px-4 py-3 text-left font-medium">Discount</th>
                  <th className="px-4 py-3 text-left font-medium">Usage</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Expires</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium">{c.code}</span>
                      {c.description && <p className="text-xs text-neutral-500">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">{discountLabel(c)}</td>
                    <td className="px-4 py-3">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.is_active ? "success" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => editCoupon(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No coupons yet. Click &quot;Add Coupon&quot; to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
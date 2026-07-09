"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    title: "", image_url: "", link_url: "", position: "hero", is_active: true, sort_order: 0,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/banners");
    setBanners(await res.json());
  }

  function editBanner(b: any) {
    setForm({ title: b.title || "", image_url: b.image_url, link_url: b.link_url || "", position: b.position, is_active: b.is_active, sort_order: b.sort_order });
    setEditing(b.id);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url.trim()) { toast({ type: "error", title: "Image URL required" }); return; }
    const url = editing ? `/api/banners/${editing}` : "/api/banners";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { toast({ type: "error", title: "Save failed" }); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", image_url: "", link_url: "", position: "hero", is_active: true, sort_order: 0 });
    toast({ type: "success", title: editing ? "Banner updated" : "Banner created" });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    if (!res.ok) { toast({ type: "error", title: "Delete failed" }); return; }
    toast({ type: "success", title: "Banner deleted" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: "", image_url: "", link_url: "", position: "hero", is_active: true, sort_order: 0 }); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit Banner" : "New Banner"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Image URL *</Label>
                <Input required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <select className="flex h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                  <option value="hero">Hero</option>
                  <option value="top">Top</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <Card key={banner.id}>
            <CardContent className="p-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-neutral-100 mb-3">
                <img src={banner.image_url} alt={banner.title || ""} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{banner.title || "Untitled"}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Badge variant="secondary">{banner.position}</Badge>
                  <Badge variant={banner.is_active ? "success" : "secondary"}>{banner.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => editBanner(banner)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(banner.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

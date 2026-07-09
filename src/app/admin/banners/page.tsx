"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Palette, ExternalLink, ImageIcon, Megaphone, Percent, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const positionIcons: Record<string, React.ReactNode> = {
  hero: <Megaphone className="h-3.5 w-3.5" />,
  promo: <Percent className="h-3.5 w-3.5" />,
  popup: <Sparkles className="h-3.5 w-3.5" />,
  sidebar: <ImageIcon className="h-3.5 w-3.5" />,
  bottom: <ExternalLink className="h-3.5 w-3.5" />,
};

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    title: "", subtitle: "", image_url: "", link_url: "", link_text: "",
    position: "hero", is_active: true, sort_order: 0, bg_color: "", text_color: "",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch("/api/banners");
      const json = await res.json();
      setBanners(json.data || json);
    } catch {
      toast({ type: "error", title: "Failed to load banners" });
    }
  }

  function editBanner(b: any) {
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      image_url: b.image_url || "",
      link_url: b.link_url || "",
      link_text: b.link_text || "",
      position: b.position,
      is_active: b.is_active,
      sort_order: b.sort_order,
      bg_color: b.bg_color || "",
      text_color: b.text_color || "",
    });
    setEditing(b.id);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url.trim()) { toast({ type: "error", title: "Image URL required" }); return; }
    const url = editing ? `/api/banners/${editing}` : "/api/banners";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { toast({ type: "error", title: "Save failed" }); return; }
      toast({ type: "success", title: editing ? "Banner updated" : "Banner created" });
    } catch {
      toast({ type: "error", title: "Connection error" });
      return;
    }
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", subtitle: "", image_url: "", link_url: "", link_text: "", position: "hero", is_active: true, sort_order: 0, bg_color: "", text_color: "" });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (!res.ok) { toast({ type: "error", title: "Delete failed" }); return; }
      toast({ type: "success", title: "Banner deleted" });
    } catch {
      toast({ type: "error", title: "Connection error" });
      return;
    }
    load();
  }

  const previewStyle = form.bg_color ? { backgroundColor: form.bg_color, color: form.text_color || "#fff" } : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: "", subtitle: "", image_url: "", link_url: "", link_text: "", position: "hero", is_active: true, sort_order: 0, bg_color: "", text_color: "" }); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editing ? "Edit Banner" : "New Banner"}
              {form.position === "popup" && <Badge variant="warning" className="ml-2">Popup Offer</Badge>}
              {form.position === "promo" && <Badge variant="success" className="ml-2">Promo</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 content-start">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Up to 50% off" />
                </div>
                <div className="space-y-2">
                  <Label>Image URL *</Label>
                  <Input required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Link URL</Label>
                  <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/sale" />
                </div>
                <div className="space-y-2">
                  <Label>Link Text</Label>
                  <Input value={form.link_text} onChange={(e) => setForm({ ...form, link_text: e.target.value })} placeholder="Shop Now" />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <select className="flex h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                    <option value="hero">Hero Banner</option>
                    <option value="promo">Promo Bar</option>
                    <option value="popup">Popup Offer</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="bottom">Bottom Bar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.bg_color || "#000000"} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="h-10 w-10 rounded border shrink-0" />
                    <Input value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} placeholder="#1a1a2e" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.text_color || "#ffffff"} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="h-10 w-10 rounded border shrink-0" />
                    <Input value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} placeholder="#ffffff" />
                  </div>
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

              <Card className="bg-neutral-50 border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.position === "popup" && (
                    <div className="relative mx-auto max-w-xs rounded-xl border bg-white shadow-2xl overflow-hidden" style={previewStyle}>
                      {form.image_url && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={form.image_url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      )}
                      <div className="p-4 text-center space-y-1">
                        {form.title && <p className="text-lg font-bold">{form.title}</p>}
                        {form.subtitle && <p className="text-sm opacity-80">{form.subtitle}</p>}
                        {form.link_text && (
                          <span className="inline-block mt-2 text-sm font-semibold underline underline-offset-2">{form.link_text} &rarr;</span>
                        )}
                      </div>
                      <button className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/20 text-white flex items-center justify-center text-xs">&times;</button>
                    </div>
                  )}
                  {form.position === "promo" && (
                    <div className="flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium" style={previewStyle}>
                      {form.title && <span className="font-bold">{form.title}</span>}
                      {form.subtitle && <span className="opacity-90">{form.subtitle}</span>}
                      {form.link_text && <span className="underline">{form.link_text}</span>}
                    </div>
                  )}
                  {(form.position === "hero" || form.position === "sidebar" || form.position === "bottom") && (
                    <div className="aspect-video overflow-hidden rounded-lg bg-neutral-200 flex items-center justify-center">
                      {form.image_url ? (
                        <img src={form.image_url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class='text-neutral-400 text-sm'>Image preview</span>`; }} />
                      ) : (
                        <span className="text-neutral-400 text-sm">No image selected</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                    {form.position && <Badge variant="outline" className="flex items-center gap-1">{positionIcons[form.position]}{form.position}</Badge>}
                    {form.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <Card key={banner.id} className={banner.position === "popup" ? "ring-2 ring-amber-400/40" : ""}>
            <CardContent className="p-4">
              {banner.position === "popup" ? (
                <div className="relative mb-3 rounded-xl overflow-hidden" style={banner.bg_color ? { backgroundColor: banner.bg_color, color: banner.text_color || "#fff" } : {}}>
                  <div className="p-3 text-center space-y-1">
                    {banner.title && <p className="text-sm font-bold">{banner.title}</p>}
                    {banner.subtitle && <p className="text-xs opacity-80">{banner.subtitle}</p>}
                  </div>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={banner.image_url} alt={banner.title || ""} className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/20 text-white flex items-center justify-center text-xs">&times;</div>
                </div>
              ) : (
                <div className="aspect-video overflow-hidden rounded-lg bg-neutral-100 mb-3">
                  <img src={banner.image_url} alt={banner.title || ""} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="space-y-1.5">
                <p className="font-medium text-sm">{banner.title || "Untitled"}</p>
                {banner.subtitle && <p className="text-xs text-neutral-500">{banner.subtitle}</p>}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">{positionIcons[banner.position]}{banner.position}</Badge>
                  <Badge variant={banner.is_active ? "success" : "secondary"} className="text-xs">{banner.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => editBanner(banner)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(banner.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-500">No banners yet. Click &quot;Add Banner&quot; to create one.</div>
        )}
      </div>
    </div>
  );
}
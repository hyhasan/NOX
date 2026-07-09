"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    title: "", slug: "", content_html: "", meta_title: "", meta_description: "", og_image: "", is_published: false,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/pages");
    setPages(await res.json());
  }

  function editPage(p: any) {
    setForm({ title: p.title, slug: p.slug, content_html: p.content_html || "", meta_title: p.meta_title || "", meta_description: p.meta_description || "", og_image: p.og_image || "", is_published: p.is_published });
    setEditing(p.id);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/pages/${editing}` : "/api/pages";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", slug: "", content_html: "", meta_title: "", meta_description: "", og_image: "", is_published: false });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: "", slug: "", content_html: "", meta_title: "", meta_description: "", og_image: "", is_published: false }); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Page
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit Page" : "New Page"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Content (HTML)</Label>
                <Textarea rows={10} value={form.content_html} onChange={(e) => setForm({ ...form, content_html: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input value={form.og_image} onChange={(e) => setForm({ ...form, og_image: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                <Label htmlFor="published">Published</Label>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-neutral-500">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.is_published ? "success" : "secondary"}>{p.is_published ? "Published" : "Draft"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => editPage(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

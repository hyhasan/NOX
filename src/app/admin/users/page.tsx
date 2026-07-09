"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface AdminUser {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  super_admin: <ShieldAlert className="h-4 w-4 text-red-500" />,
  admin: <ShieldCheck className="h-4 w-4 text-blue-500" />,
  manager: <Shield className="h-4 w-4 text-purple-500" />,
  editor: <Shield className="h-4 w-4 text-green-500" />,
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nox-admin");
      if (stored) { try { return JSON.parse(stored).id; } catch {} }
    }
    return null;
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    username: "", password: "", display_name: "", email: "", role: "admin", is_active: true,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const token = localStorage.getItem("nox-admin-token");
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast({ type: "error", title: "Failed to load users" }); return; }
      const json = await res.json();
      setUsers(json.data || json);
    } catch { toast({ type: "error", title: "Connection error" }); }
  }

  function editUser(u: AdminUser) {
    setForm({
      username: u.username,
      password: "",
      display_name: u.display_name || "",
      email: u.email || "",
      role: u.role,
      is_active: u.is_active,
    });
    setEditing(u.id);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim()) { toast({ type: "error", title: "Username required" }); return; }
    if (!editing && (!form.password || form.password.length < 6)) { toast({ type: "error", title: "Password must be at least 6 characters" }); return; }

    const token = localStorage.getItem("nox-admin-token");
    const url = editing ? `/api/admin/users/${editing}` : "/api/admin/users";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast({ type: "error", title: "Save failed", message: d.error || "Please try again." }); return; }
      toast({ type: "success", title: editing ? "User updated" : "User created" });
    } catch { toast({ type: "error", title: "Connection error" }); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ username: "", password: "", display_name: "", email: "", role: "admin", is_active: true });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this admin user?")) return;
    const token = localStorage.getItem("nox-admin-token");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast({ type: "error", title: "Delete failed", message: d.error || "Cannot delete" }); return; }
      toast({ type: "success", title: "User deleted" });
    } catch { toast({ type: "error", title: "Connection error" }); return; }
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Users</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ username: "", password: "", display_name: "", email: "", role: "admin", is_active: true }); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Admin
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit Admin" : "New Admin"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password {!editing && "*"}</Label>
                <Input type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Leave blank to keep current" : ""} />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="flex h-10 w-full rounded-lg border bg-white px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50">
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Last Login</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold">
                          {(u.display_name || u.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.display_name || u.username}</p>
                          <p className="text-xs text-neutral-500">@{u.username}{u.email ? ` · ${u.email}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {roleIcons[u.role] || <Shield className="h-4 w-4" />}
                        <span className="capitalize">{u.role.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.id === currentUserId ? (
                        <Badge variant="success">You</Badge>
                      ) : (
                        <Badge variant={u.is_active ? "success" : "secondary"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "Never"}</td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => editUser(u)}><Pencil className="h-4 w-4" /></Button>
                      {u.id !== currentUserId && (
                        <Button variant="ghost" size="sm" onClick={() => remove(u.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No admin users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function AdminAppearancePage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setSettings);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const keys = ["site_name", "primary_color", "secondary_color", "footer_text", "logo_url", "favicon_url"];
    const data: Record<string, string> = {};
    for (const key of keys) {
      data[key] = settings[key] || "";
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast({ type: "error", title: "Save failed" }); return; }
      toast({ type: "success", title: "Settings saved" });
    } catch {
      toast({ type: "error", title: "Connection error", message: "Unable to reach the server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appearance</h1>

      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input value={settings.site_name || ""} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={settings.logo_url || ""} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input value={settings.favicon_url || ""} onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Colors</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primary_color || "#000000"}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="h-10 w-10 rounded border"
                />
                <Input value={settings.primary_color || ""} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.secondary_color || "#ffffff"}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="h-10 w-10 rounded border"
                />
                <Input value={settings.secondary_color || ""} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Footer</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Footer Text</Label>
              <Input value={settings.footer_text || ""} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </form>
    </div>
  );
}

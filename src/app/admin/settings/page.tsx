"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { AlertCircle, CheckCircle, Eye, EyeOff, Globe, Mail } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", newUsername: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [savingSite, setSavingSite] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(async (r) => {
      const json = await r.json();
      setSiteSettings(json);
    });
  }, []);

  function validatePw() {
    const e: Record<string, string> = {};
    if (!pwForm.currentPassword) e.currentPassword = "Current password is required";
    if (pwForm.newPassword && pwForm.newPassword.length < 6) e.newPassword = "Password must be at least 6 characters";
    return e;
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validatePw();
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) { toast({ type: "error", title: "Validation error", message: Object.values(errs).join(", ") }); return; }
    if (!pwForm.newUsername && !pwForm.newPassword) { toast({ type: "warning", title: "Nothing to update", message: "Enter a new username or password." }); return; }
    setSavingPw(true);
    try {
      const token = localStorage.getItem("nox-admin-token");
      if (!token) { toast({ type: "error", title: "Session expired", message: "Please log in again." }); setSavingPw(false); return; }
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pwForm),
      });
      if (res.ok) {
        toast({ type: "success", title: "Credentials updated" });
        setPwForm({ currentPassword: "", newPassword: "", newUsername: "" });
        setPwErrors({});
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ type: "error", title: res.status === 401 ? "Session expired" : "Update failed", message: data.error || "Please try again." });
      }
    } catch { toast({ type: "error", title: "Connection error" }); }
    finally { setSavingPw(false); }
  }

  async function handleSiteSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingSite(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });
      if (!res.ok) { toast({ type: "error", title: "Save failed" }); return; }
      toast({ type: "success", title: "Site settings saved" });
    } catch { toast({ type: "error", title: "Connection error" }); }
    finally { setSavingSite(false); }
  }

  const updateSetting = (key: string, value: string) => setSiteSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">System Settings</h1>
        <p className="mt-1 text-sm text-secondary/60">Manage your store configuration</p>
      </div>

      {/* Site Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            Site Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSiteSave} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Site Name</Label>
                <Input value={siteSettings.site_name || ""} onChange={(e) => updateSetting("site_name", e.target.value)} placeholder="NOX Store" />
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input value={siteSettings.tagline || ""} onChange={(e) => updateSetting("tagline", e.target.value)} placeholder="Your premium store" />
              </div>
              <div className="space-y-1.5">
                <Label>Logo URL</Label>
                <Input value={siteSettings.logo_url || ""} onChange={(e) => updateSetting("logo_url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Favicon URL</Label>
                <Input value={siteSettings.favicon_url || ""} onChange={(e) => updateSetting("favicon_url", e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Support Email</Label>
                  <Input type="email" value={siteSettings.support_email || ""} onChange={(e) => updateSetting("support_email", e.target.value)} placeholder="support@nox.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Support Phone</Label>
                  <Input value={siteSettings.support_phone || ""} onChange={(e) => updateSetting("support_phone", e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea value={siteSettings.address || ""} onChange={(e) => updateSetting("address", e.target.value)} placeholder="Store address" rows={2} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> SEO Defaults</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Default Meta Title</Label>
                  <Input value={siteSettings.default_meta_title || ""} onChange={(e) => updateSetting("default_meta_title", e.target.value)} placeholder="NOX - Premium Store" />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Meta Description</Label>
                  <Input value={siteSettings.default_meta_description || ""} onChange={(e) => updateSetting("default_meta_description", e.target.value)} placeholder="Discover premium products at NOX" />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">&#36; Store Settings</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input value={siteSettings.currency || ""} onChange={(e) => updateSetting("currency", e.target.value)} placeholder="USD" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tax Rate (%)</Label>
                  <Input value={siteSettings.tax_rate || ""} onChange={(e) => updateSetting("tax_rate", e.target.value)} placeholder="8" />
                </div>
                <div className="space-y-1.5">
                  <Label>Free Shipping Threshold</Label>
                  <Input value={siteSettings.free_shipping_threshold || ""} onChange={(e) => updateSetting("free_shipping_threshold", e.target.value)} placeholder="50" />
                </div>
              </div>
              <div className="space-y-1.5 mt-3">
                <Label>Footer Text</Label>
                <Textarea value={siteSettings.footer_text || ""} onChange={(e) => updateSetting("footer_text", e.target.value)} rows={2} placeholder="&copy; 2026 NOX. All rights reserved." />
              </div>
            </div>

            <Button type="submit" disabled={savingSite}>
              {savingSite ? "Saving..." : "Save Site Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Credentials */}
      <Card className="border-border/50 max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            Change Admin Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input id="currentPassword" type={showCurrent ? "text" : "password"} required value={pwForm.currentPassword} onChange={(e) => { setPwForm({ ...pwForm, currentPassword: e.target.value }); setPwErrors((prev) => { const next = { ...prev }; delete next.currentPassword; return next; }); }} className={`pr-10 ${pwErrors.currentPassword ? "border-destructive" : ""}`} placeholder="Enter current password" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/70 cursor-pointer" onClick={() => setShowCurrent(!showCurrent)} tabIndex={-1}>{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {pwErrors.currentPassword && <p className="text-xs text-destructive">{pwErrors.currentPassword}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newUsername">New Username</Label>
              <Input id="newUsername" value={pwForm.newUsername} onChange={(e) => setPwForm({ ...pwForm, newUsername: e.target.value })} placeholder="Leave blank to keep current" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type={showNew ? "text" : "password"} value={pwForm.newPassword} onChange={(e) => { setPwForm({ ...pwForm, newPassword: e.target.value }); setPwErrors((prev) => { const next = { ...prev }; delete next.newPassword; return next; }); }} className={`pr-10 ${pwErrors.newPassword ? "border-destructive" : ""}`} placeholder="Leave blank to keep current" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/70 cursor-pointer" onClick={() => setShowNew(!showNew)} tabIndex={-1}>{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {pwErrors.newPassword && <p className="text-xs text-destructive">{pwErrors.newPassword}</p>}
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>You&apos;ll need your current password to make any changes.</p>
            </div>

            <Button type="submit" disabled={savingPw}>
              {savingPw ? "Saving..." : "Update Credentials"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
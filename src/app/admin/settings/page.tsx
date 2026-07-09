"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { AlertCircle, CheckCircle, Eye, EyeOff, Save } from "lucide-react";

interface FormErrors {
  currentPassword?: string;
  newUsername?: string;
  newPassword?: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", newUsername: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.currentPassword) e.currentPassword = "Current password is required";
    if (form.newPassword && form.newPassword.length < 6) e.newPassword = "Password must be at least 6 characters";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({ type: "error", title: "Validation error", message: Object.values(errs).join(", ") });
      return;
    }

    if (!form.newUsername && !form.newPassword) {
      toast({ type: "warning", title: "Nothing to update", message: "Enter a new username or password to change." });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("nox-admin-token");
      if (!token) {
        toast({ type: "error", title: "Session expired", message: "Please log in again." });
        setSaving(false);
        return;
      }

      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast({ type: "success", title: "Settings updated", message: "Your credentials have been changed successfully." });
        setForm({ currentPassword: "", newPassword: "", newUsername: "" });
        setErrors({});
      } else {
        const data = await res.json().catch(() => ({}));
        toast({
          type: "error",
          title: res.status === 401 ? "Session expired" : "Update failed",
          message: data.error || "Please try again.",
        });
      }
    } catch {
      toast({ type: "error", title: "Connection error", message: "Unable to reach the server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">System Settings</h1>
        <p className="mt-1 text-sm text-secondary/60">Update your admin credentials</p>
      </div>

      <Card className="border-border/50 max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            Change Admin Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <PwField
              id="currentPassword"
              label="Current Password"
              required
              value={form.currentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              error={errors.currentPassword}
              onChange={(v) => { setForm({ ...form, currentPassword: v }); setErrors({ ...errors, currentPassword: undefined }); }}
            />

            <div className="space-y-1.5">
              <Label htmlFor="newUsername">New Username</Label>
              <Input
                id="newUsername"
                value={form.newUsername}
                onChange={(e) => setForm({ ...form, newUsername: e.target.value })}
                placeholder="Leave blank to keep current"
                className={errors.newUsername ? "border-destructive" : ""}
              />
              {errors.newUsername && (
                <p className="text-xs text-destructive flex items-center gap-1">&#9888; {errors.newUsername}</p>
              )}
            </div>

            <PwField
              id="newPassword"
              label="New Password"
              value={form.newPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              error={errors.newPassword}
              onChange={(v) => { setForm({ ...form, newPassword: v }); setErrors({ ...errors, newPassword: undefined }); }}
              placeholder="Leave blank to keep current"
            />

            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>You&apos;ll need your current password to make any changes.</p>
            </div>

            <Button type="submit" disabled={saving} className="w-full cursor-pointer">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Update Settings</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PwField({ id, label, required, value, show, onToggle, error, onChange, placeholder }: {
  id: string; label: string; required?: boolean; value: string; show: boolean; onToggle: () => void;
  error?: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{required && <span className="ml-1 text-destructive">*</span>}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pr-10 ${error ? "border-destructive" : ""}`}
          placeholder={placeholder}
        />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/70 cursor-pointer" onClick={onToggle} tabIndex={-1}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive flex items-center gap-1">&#9888; {error}</p>}
    </div>
  );
}

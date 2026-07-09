"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

function validate(form: typeof initial): FormErrors {
  const e: FormErrors = {};
  if (!form.name.trim()) e.name = "Name is required";
  if (!form.email.trim()) { e.email = "Email is required"; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
  if (!form.message.trim()) e.message = "Message is required";
  else if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
  return e;
}

const initial = { name: "", email: "", phone: "", message: "" };

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(form)[field as keyof FormErrors] }));
  }

  function setAndValidate(field: keyof typeof initial, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      const errs = validate(next);
      setErrors((prev) => ({ ...prev, [field]: errs[field] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.keys(errs).length > 0) {
      toast({ type: "error", title: "Please fix the errors", message: Object.values(errs).join(", ") });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        toast({ type: "success", title: "Message sent!", message: "We'll get back to you shortly." });
      } else {
        const d = await res.json().catch(() => ({}));
        toast({ type: "error", title: "Failed to send", message: d.error || "Please try again later." });
      }
    } catch {
      toast({ type: "error", title: "Connection error", message: "Unable to reach the server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container-site py-24 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-6 font-heading text-3xl font-bold">Message Sent!</h1>
        <p className="mt-2 text-secondary/60">We&apos;ll get back to you within 24 hours.</p>
        <Button className="mt-8 cursor-pointer" onClick={() => { setSubmitted(false); setForm(initial); setTouched({}); setErrors({}); }}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="container-site py-16">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold">Contact Us</h1>
        <p className="mt-2 text-secondary/60">We&apos;d love to hear from you.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: "hello@nox.com", href: "mailto:hello@nox.com" },
            { icon: Phone, label: "Phone", value: "+1 (555) 000-0000", href: "tel:+15550000000" },
            { icon: MapPin, label: "Address", value: "123 Commerce St, New York, NY 10001" },
          ].map((item) => (
            <Card key={item.label} className="feature-card !bg-background">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-secondary/50">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium text-primary hover:text-accent transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-primary">{item.value}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field label="Name" required error={errors.name} touched={touched.name}>
            <Input
              value={form.name}
              onChange={(e) => setAndValidate("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={errors.name && touched.name ? "border-destructive" : ""}
              placeholder="Your name"
            />
          </Field>

          <Field label="Email" required error={errors.email} touched={touched.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setAndValidate("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={errors.email && touched.email ? "border-destructive" : ""}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setAndValidate("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </Field>

          <Field label="Message" required error={errors.message} touched={touched.message}>
            <Textarea
              rows={5}
              value={form.message}
              onChange={(e) => setAndValidate("message", e.target.value)}
              onBlur={() => handleBlur("message")}
              className={errors.message && touched.message ? "border-destructive" : ""}
              placeholder="How can we help you?"
            />
          </Field>

          <Button type="submit" size="lg" className="w-full cursor-pointer" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Send Message
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, touched, children }: {
  label: string; required?: boolean; error?: string; touched?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {touched && error && (
        <p className="text-xs text-destructive flex items-center gap-1">&#9888; {error}</p>
      )}
    </div>
  );
}

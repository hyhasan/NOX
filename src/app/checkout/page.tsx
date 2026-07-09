"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, DollarSign, Landmark, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

function validateForm(form: typeof initialForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Full name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }
  if (form.phone && !/^[\d\s\-+()]{7,15}$/.test(form.phone)) {
    errors.phone = "Enter a valid phone number";
  }
  if (!form.address.trim()) errors.address = "Street address is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.state.trim()) errors.state = "State is required";
  if (!form.zip.trim()) errors.zip = "ZIP code is required";
  return errors;
}

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", desc: "Pay when you receive your order", icon: DollarSign },
  { id: "stripe", label: "Credit / Debit Card", desc: "Pay securely with Stripe", icon: CreditCard },
  { id: "razorpay", label: "UPI / Net Banking", desc: "Pay via UPI, Net Banking or Wallet", icon: Landmark },
] as const;

const initialForm = { name: "", email: "", phone: "", address: "", city: "", state: "", zip: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, getTotal, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validateForm(form);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field as keyof FormErrors] }));
  }

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode)}&total=${getTotal()}`);
      const data = await res.json();
      if (data.valid && data.discount > 0) {
        setCouponDiscount(data.discount);
        toast({ type: "success", title: "Coupon applied!", message: `${data.message || ""}` });
      } else {
        setCouponDiscount(0);
        setCouponError(data.error || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  const subtotal = getTotal();
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const taxRate = 0.08;
  const taxAmount = Math.round((subtotal - couponDiscount) * taxRate * 100) / 100;
  const finalTotal = Math.round((subtotal - couponDiscount + shipping + taxAmount) * 100) / 100;

  function setAndValidate(field: keyof typeof initialForm, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      const fieldErrors = validateForm(next);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const fieldErrors = validateForm(form);
    setErrors(fieldErrors);
    setTouched({ name: true, email: true, phone: true, address: true, city: true, state: true, zip: true });

    if (Object.keys(fieldErrors).length > 0) {
      toast({
        type: "error",
        title: "Please fix the form errors",
        message: Object.values(fieldErrors).filter(Boolean).join(", "),
      });
      return;
    }

    setSubmitting(true);
    try {
      const fullAddress = `${form.address}, ${form.city}, ${form.state} ${form.zip}`;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          address: fullAddress,
          payment_method: paymentMethod,
          coupon_code: couponCode || undefined,
          items: items.map((i) => ({
            product_id: i.product_id,
            product_name_snapshot: i.name,
            product_sku_snapshot: i.sku || undefined,
            price_snapshot: i.price,
            quantity: i.quantity,
          })),
          total_amount: subtotal,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        toast({ type: "success", title: "Order placed!", message: `Order #${data.order_number}` });

        if (paymentMethod === "COD") {
          router.push(`/checkout/success?order=${data.order_number}`);
        } else {
          router.push(`/payment/${data.id}?method=${paymentMethod}`);
        }
      } else {
        toast({ type: "error", title: "Checkout failed", message: data.error || "Please try again." });
        setSubmitting(false);
      }
    } catch {
      toast({ type: "error", title: "Connection error", message: "Unable to reach the server." });
      setSubmitting(false);
    }
  }

  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="mb-8 font-heading text-2xl font-bold sm:text-3xl">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2" noValidate>
          <Card className="feature-card !bg-background">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" required error={errors.name} touched={touched.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => setAndValidate("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className={errors.name && touched.name ? "border-destructive" : ""}
                    placeholder="John Doe"
                  />
                </Field>
                <Field label="Email" required error={errors.email} touched={touched.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setAndValidate("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={errors.email && touched.email ? "border-destructive" : ""}
                    placeholder="john@example.com"
                  />
                </Field>
              </div>
              <Field label="Phone (optional)" error={errors.phone} touched={touched.phone}>
                <Input
                  value={form.phone}
                  onChange={(e) => setAndValidate("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  className={errors.phone && touched.phone ? "border-destructive" : ""}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="feature-card !bg-background">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Street Address" required error={errors.address} touched={touched.address}>
                <Textarea
                  value={form.address}
                  onChange={(e) => setAndValidate("address", e.target.value)}
                  onBlur={() => handleBlur("address")}
                  className={errors.address && touched.address ? "border-destructive" : ""}
                  placeholder="123 Main St, Apt 4B"
                  rows={2}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" required error={errors.city} touched={touched.city}>
                  <Input
                    value={form.city}
                    onChange={(e) => setAndValidate("city", e.target.value)}
                    onBlur={() => handleBlur("city")}
                    className={errors.city && touched.city ? "border-destructive" : ""}
                    placeholder="New York"
                  />
                </Field>
                <Field label="State" required error={errors.state} touched={touched.state}>
                  <Input
                    value={form.state}
                    onChange={(e) => setAndValidate("state", e.target.value)}
                    onBlur={() => handleBlur("state")}
                    className={errors.state && touched.state ? "border-destructive" : ""}
                    placeholder="NY"
                  />
                </Field>
                <Field label="ZIP Code" required error={errors.zip} touched={touched.zip}>
                  <Input
                    value={form.zip}
                    onChange={(e) => setAndValidate("zip", e.target.value)}
                    onBlur={() => handleBlur("zip")}
                    className={errors.zip && touched.zip ? "border-destructive" : ""}
                    placeholder="10001"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card !bg-background">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const selected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                      selected
                        ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                        : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      selected ? "bg-accent text-on-primary" : "bg-muted text-secondary/50"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${selected ? "text-accent" : "text-primary"}`}>{method.label}</p>
                      <p className="text-xs text-secondary/50">{method.desc}</p>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 transition-colors ${
                      selected ? "border-accent bg-accent" : "border-border"
                    }`}>
                      {selected && <div className="h-2 w-2 rounded-full bg-white m-auto mt-[1px]" />}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="hidden w-full sm:flex cursor-pointer" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              `Place Order — ${formatPrice(finalTotal)}`
            )}
          </Button>
        </form>

        <div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <button
              type="button"
              onClick={() => setSummaryOpen(!summaryOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-background p-4 font-medium text-primary lg:hidden"
            >
              <span>Order Summary ({items.length} items)</span>
              {summaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <Card className={`feature-card !bg-background mt-4 lg:mt-0 ${summaryOpen ? "block" : "hidden lg:block"}`}>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="flex-1 truncate text-secondary/70">
                      {item.name} <span className="text-secondary/40">x{item.quantity}</span>
                    </span>
                    <span className="ml-2 font-medium text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-border/30 pt-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponDiscount(0); setCouponError(""); }}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={validateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="shrink-0 cursor-pointer"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="mt-1 text-xs text-accent">Coupon applied: -{formatPrice(couponDiscount)}</p>
                  )}
                  {couponError && <p className="mt-1 text-xs text-destructive">{couponError}</p>}
                </div>

                <div className="space-y-2 border-t border-border/30 pt-4 text-sm">
                  <div className="flex justify-between text-secondary/70">
                    <span>Subtotal</span>
                    <span className="text-primary">{formatPrice(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-secondary/70">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-accent" : "text-primary"}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-secondary/70">
                    <span>Tax</span>
                    <span className="text-primary">{formatPrice(taxAmount)}</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between font-heading text-lg font-bold text-primary">
                    <span>Total</span>
                    <span className="text-accent">{formatPrice(finalTotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-secondary/50">
                    {paymentMethod === "COD" ? "Pay with cash on delivery" : `Pay with ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="mt-4 w-full sm:hidden cursor-pointer" disabled={submitting}
              onClick={handleSubmit}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : (
                `Place Order — ${formatPrice(finalTotal)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, required, error, touched, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}) {
  const showError = touched && error;
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {showError && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <span>&#9888;</span> {error}
        </p>
      )}
    </div>
  );
}

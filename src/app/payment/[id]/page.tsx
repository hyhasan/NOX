"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, DollarSign, Landmark, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { Order } from "@/types";

const PAYMENT_METHODS: Record<string, { id: string; label: string; icon: typeof CreditCard; fields: string[] }> = {
  stripe: { id: "stripe", label: "Credit / Debit Card", icon: CreditCard, fields: ["cardNumber", "expiry", "cvc", "name"] },
  razorpay: { id: "razorpay", label: "UPI / Net Banking", icon: Landmark, fields: ["upiId"] },
  COD: { id: "COD", label: "Cash on Delivery", icon: DollarSign, fields: [] },
};

export default function PaymentPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ method?: string }>;
}) {
  const { id } = use(params);
  const { method } = use(searchParams);
  const router = useRouter();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [cardForm, setCardForm] = useState({ cardNumber: "", expiry: "", cvc: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const methodInfo = method ? PAYMENT_METHODS[method] : PAYMENT_METHODS.COD;
  const isCOD = method === "COD" || !method;

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const o = data.data || data;
        setOrder(o);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  function validateCard() {
    const errs: Record<string, string> = {};
    if (!cardForm.cardNumber.replace(/\s/g, "").match(/^\d{13,19}$/)) errs.cardNumber = "Invalid card number";
    if (!cardForm.expiry.match(/^\d{2}\/\d{2}$/)) errs.expiry = "MM/YY required";
    if (!cardForm.cvc.match(/^\d{3,4}$/)) errs.cvc = "Invalid CVC";
    if (!cardForm.name.trim()) errs.name = "Cardholder name required";
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  async function handlePayment() {
    if (isCOD) {
      router.push(`/checkout/success?order=${order?.order_number}`);
      return;
    }

    if (method === "stripe" && !validateCard()) return;
    if (method === "razorpay" && !upiId.trim()) {
      toast({ type: "error", title: "UPI ID required", message: "Please enter your UPI ID" });
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: "paid", order_status: "confirmed", paid_at: new Date().toISOString() }),
      });

      toast({ type: "success", title: "Payment successful!", message: "Your order has been confirmed." });
      setCompleted(true);
    } catch {
      toast({ type: "error", title: "Payment failed", message: "Please try again or choose a different method." });
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="container-site py-24 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent" />
        <p className="mt-4 text-secondary/60">Loading payment details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-site py-24 text-center">
        <XCircle className="mx-auto h-16 w-16 text-destructive/50" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Order Not Found</h1>
        <Button className="mt-6" asChild><Link href="/">Back to Home</Link></Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container-site py-24 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-accent" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Payment Complete!</h1>
        <p className="mt-2 text-secondary/60">Your payment was processed successfully.</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button asChild><Link href={`/checkout/success?order=${order.order_number}`}>View Order</Link></Button>
          <Button variant="outline" asChild><Link href="/products">Continue Shopping</Link></Button>
        </div>
      </div>
    );
  }

  const Icon = methodInfo?.icon || DollarSign;

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-xl">
        <Link href="/checkout" className="mb-6 flex items-center gap-2 text-sm text-secondary/60 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to checkout
        </Link>

        <Card className="feature-card !bg-background">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>{methodInfo?.label || "Payment"}</CardTitle>
                <p className="text-xs text-secondary/50">Order #{order.order_number}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-xs text-secondary/50 uppercase tracking-wide">Total Due</p>
              <p className="font-heading text-3xl font-bold text-primary">{formatPrice(order.total_amount)}</p>
            </div>

            {isCOD && (
              <div className="space-y-4">
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-secondary/70">
                  <p className="font-medium text-primary">Pay with Cash on Delivery</p>
                  <p className="mt-1">Have your cash ready when your order arrives. Our delivery partner will collect the payment at your doorstep.</p>
                </div>
                <Button size="lg" className="w-full cursor-pointer" onClick={handlePayment}>
                  Confirm COD Order
                </Button>
              </div>
            )}

            {method === "stripe" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Cardholder Name</Label>
                  <Input value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className={cardErrors.name ? "border-destructive" : ""} placeholder="John Doe" />
                  {cardErrors.name && <p className="text-xs text-destructive">{cardErrors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Card Number</Label>
                  <Input value={cardForm.cardNumber} onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                    className={cardErrors.cardNumber ? "border-destructive" : ""} placeholder="4242 4242 4242 4242" />
                  {cardErrors.cardNumber && <p className="text-xs text-destructive">{cardErrors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Expiry</Label>
                    <Input value={cardForm.expiry} onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                      setCardForm({ ...cardForm, expiry: v });
                    }} className={cardErrors.expiry ? "border-destructive" : ""} placeholder="MM/YY" />
                    {cardErrors.expiry && <p className="text-xs text-destructive">{cardErrors.expiry}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>CVC</Label>
                    <Input value={cardForm.cvc} onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      className={cardErrors.cvc ? "border-destructive" : ""} placeholder="123" />
                    {cardErrors.cvc && <p className="text-xs text-destructive">{cardErrors.cvc}</p>}
                  </div>
                </div>
                <Button size="lg" className="w-full cursor-pointer" onClick={handlePayment} disabled={processing}>
                  {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay ${formatPrice(order.total_amount)}`}
                </Button>
                <p className="text-center text-xs text-secondary/40">Secured by Stripe. Your card info is encrypted.</p>
              </div>
            )}

            {method === "razorpay" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>UPI ID</Label>
                  <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@upi" />
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs text-secondary/50">
                  <p>Pay via any UPI app: Google Pay, PhonePe, Paytm, or BHIM.</p>
                </div>
                <Button size="lg" className="w-full cursor-pointer" onClick={handlePayment} disabled={processing}>
                  {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay ${formatPrice(order.total_amount)}`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

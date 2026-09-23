"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const reseller = searchParams.get("reseller");
  const [product, setProduct] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const safeFetch = async (url: string) => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        try { return JSON.parse(text); } catch { return null; }
      } catch { return null; }
    };
    safeFetch(`/api/products/${id}`).then(d => {
      if (d) setProduct(d);
      else safeFetch(`/api/courses/${id}`).then(d2 => { if (d2) setProduct(d2); });
    });
  }, [id]);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, courseId: id, resellerCode: reseller, customerEmail: email }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Erreur serveur - DB manquante?"); }
      if (data.error) throw new Error(data.error);
      // Store for success page mock confirmation
      if (typeof window !== "undefined") {
        localStorage.setItem("last_checkout", JSON.stringify({ productId: id, courseId: id, resellerCode, customerEmail, resellerId: data.resellerId || null }));
      }
      if (data.url) window.location.href = data.url;
      else if (data.free) window.location.href = "/learn";
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[480px]">
        <Card>
          <CardHeader><CardTitle>Checkout</CardTitle><p className="text-sm text-muted">Secure payment with Stripe</p></CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-surface2 border border-border">
              <p className="font-medium">{product?.title || "Product"}</p>
              <p className="text-sm text-muted">{product?.description?.slice(0, 100) || "Digital product"}</p>
              <p className="text-lg font-semibold mt-2">{product ? (product.isFree ? "Free" : formatPrice(product.price)) : "$497.00"}</p>
              {reseller && <p className="text-xs text-success mt-1">Reseller: {reseller}</p>}
            </div>

            <div><label className="text-[13px] font-medium mb-1.5 block">Email</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{product ? (product.isFree ? "Free" : formatPrice(product.price)) : "$497.00"}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tax</span><span>Calculated at checkout</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between font-medium"><span>Total</span><span>{product ? (product.isFree ? "Free" : formatPrice(product.price)) : "$497.00"}</span></div>
            </div>

            <Button className="w-full rounded-full" onClick={handleCheckout} disabled={loading || !email}>{loading ? "Processing..." : "Pay now"}</Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted"><span>🔒</span><span>Secure checkout • SSL encrypted • 30-day guarantee</span></div>

            <div className="p-3 rounded-xl bg-surface2 border border-border text-[11px] text-muted">
              <p>By purchasing you agree to Terms and Privacy. Refund policy: 30-day money-back guarantee. For reseller sales: 90% to reseller, 10% to Nuvra after Stripe fees (2.9% + 30c) shown transparently.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted">Loading checkout...</span></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

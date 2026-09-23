"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "confirmed" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function confirm() {
      if (!sessionId) {
        setStatus("confirmed");
        return;
      }
      // If mock session, confirm via API to create order/enrollment
      if (sessionId.includes("mock")) {
        try {
          // Try to get product/course from localStorage (set by checkout page)
          const lastCheckout = typeof window !== "undefined" ? localStorage.getItem("last_checkout") : null;
          let productId = null;
          let courseId = null;
          let resellerId = null;
          if (lastCheckout) {
            try {
              const parsed = JSON.parse(lastCheckout);
              productId = parsed.productId;
              courseId = parsed.courseId;
              resellerId = parsed.resellerId;
            } catch {}
          }
          const res = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, productId, courseId, resellerId }),
          });
          const text = await res.text();
          let data: any;
          try { data = JSON.parse(text); } catch { data = { error: text.slice(0,100) }; }
          if (!res.ok) throw new Error(data.error || "Confirm failed");
          setStatus("confirmed");
          setMessage(data.existing ? "Commande déjà confirmée" : "Commande créée, accès débloqué !");
        } catch (e: any) {
          setStatus("error");
          setMessage(e.message);
        }
      } else {
        // Real Stripe - webhook will handle, just show success
        setStatus("confirmed");
      }
    }
    confirm();
  }, [sessionId]);

  return (
    <Card className="w-full max-w-[480px]">
      <CardContent className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Payment successful!</h1>
        <p className="text-sm text-muted mb-2">Thank you for your purchase. You will receive an email confirmation shortly.</p>
        {message && <p className="text-xs text-success mb-4">{message}</p>}
        {status === "loading" && <p className="text-xs text-muted mb-4">Confirmation en cours...</p>}
        {status === "error" && <p className="text-xs text-danger mb-4">{message}</p>}
        <p className="text-xs text-muted mb-8">Session: {sessionId?.slice(0, 30)}...</p>
        <div className="space-y-3">
          <Link href="/learn"><Button className="w-full rounded-full">Go to My Learning</Button></Link>
          <Link href="/dashboard"><Button variant="outline" className="w-full rounded-full">Go to Dashboard</Button></Link>
          <Link href="/payments"><Button variant="ghost" size="sm" className="w-full text-xs">Voir dans Payments (95%/90%)</Button></Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-muted">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

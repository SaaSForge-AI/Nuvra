"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <Card className="w-full max-w-[480px]"><CardContent className="p-12 text-center"><div className="h-16 w-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-8 w-8 text-success" /></div><h1 className="text-2xl font-semibold mb-2">Payment successful!</h1><p className="text-sm text-muted mb-6">Thank you for your purchase. You will receive an email confirmation shortly.</p><p className="text-xs text-muted mb-8">Session: {sessionId?.slice(0, 20)}...</p><div className="space-y-3"><Link href="/learn"><Button className="w-full rounded-full">Go to My Learning</Button></Link><Link href="/dashboard"><Button variant="outline" className="w-full rounded-full">Go to Dashboard</Button></Link></div></CardContent></Card>
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

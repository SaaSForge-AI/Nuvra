import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Help & Documentation</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Getting Started</CardTitle></CardHeader><CardContent className="text-sm text-muted space-y-2"><p>1. Create your first product</p><p>2. Build a funnel</p><p>3. Connect Stripe</p><p>4. Launch and sell</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Reseller Program</CardTitle></CardHeader><CardContent className="text-sm text-muted"><p>Earn 90% reselling Nuvra Academy. 10% goes to Nuvra. Stripe fees transparent. Payouts after 14 days.</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Creator Revenue</CardTitle></CardHeader><CardContent className="text-sm text-muted"><p>For your own courses, you keep 100% after Stripe fees. No Nuvra 10% on personal products.</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Support</CardTitle></CardHeader><CardContent className="text-sm text-muted"><p>Contact: support@nuvra.com</p><p>Docs: /docs</p></CardContent></Card>
      </div>
    </div>
  );
}

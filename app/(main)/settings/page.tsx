import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">Profile</p><p className="text-muted">Manage your account</p></CardContent></Card>
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">Workspace</p><p className="text-muted">Multi-tenant ready</p></CardContent></Card>
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">Billing</p><p className="text-muted">Pro Plan</p></CardContent></Card>
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">GDPR</p><p className="text-muted">Export & delete data</p></CardContent></Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-medium mb-1 block">First Name</label><Input defaultValue={user.firstName || ""} /></div><div><label className="text-xs font-medium mb-1 block">Last Name</label><Input defaultValue={user.lastName || ""} /></div></div><div><label className="text-xs font-medium mb-1 block">Email</label><Input defaultValue={user.email} /></div><div><label className="text-xs font-medium mb-1 block">Username</label><Input defaultValue={user.username || ""} /></div><Button size="sm">Save</Button></CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Stripe</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted">Connect Stripe to receive payments. Uses Stripe Connect for creators/resellers.</p><div className="p-3 rounded-xl bg-surface2 border border-border"><p className="text-xs">STRIPE_SECRET_KEY: {process.env.STRIPE_SECRET_KEY ? "✓ Configured" : "✗ Not configured (mock mode)"}</p><p className="text-xs">STRIPE_WEBHOOK_SECRET: {process.env.STRIPE_WEBHOOK_SECRET ? "✓ Configured" : "✗ Not configured"}</p></div><Button size="sm" variant="outline">Connect Stripe</Button></CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Privacy & GDPR</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border"><div><p className="font-medium">Export your data</p><p className="text-xs text-muted">Get all your data as JSON/CSV</p></div><Button size="sm" variant="outline">Export</Button></div><div className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border"><div><p className="font-medium">Delete account</p><p className="text-xs text-muted">Anonymize data per obligations</p></div><Button size="sm" variant="outline" className="text-danger">Delete</Button></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

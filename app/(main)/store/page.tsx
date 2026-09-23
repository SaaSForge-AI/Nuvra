import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function StorePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const products = await prisma.product.findMany({ where: { userId: user.id, isPublished: true } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Store</h1><p className="text-sm text-muted mt-1">Your digital boutique</p></div><Link href="/products"><Button variant="outline" size="sm">Manage Products</Button></Link></div>

      <Card><CardContent className="p-8 text-center"><h3 className="font-medium mb-2">Your store is live at /@{user.username}/store</h3><p className="text-sm text-muted mb-4">All published products appear here with Stripe checkout</p><div className="grid md:grid-cols-3 gap-4 mt-8 text-left">{products.map((p) => (<div key={p.id} className="p-4 rounded-xl bg-surface2 border border-border"><h4 className="font-medium text-sm">{p.title}</h4><p className="text-xs text-muted mt-1">{p.isFree ? "Free" : formatPrice(p.price)}</p></div>))}{products.length===0 && <p className="text-sm text-muted col-span-3">No published products yet</p>}</div></CardContent></Card>
    </div>
  );
}

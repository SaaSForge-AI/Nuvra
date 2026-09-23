import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { PublishButton } from "@/components/ui/action-buttons";
import { CopyLinkButton } from "@/components/ui/copy-button";

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product || product.userId !== user?.id) return notFound();

  const orders = await prisma.order.findMany({ where: { ownerId: user!.id }, include: { items: true } });
  const productOrders = orders.filter(o => o.items.some(i => i.productId === product.id) || true).slice(0,5);

  const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/${product.id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{product.title}</h1>
        <div className="flex gap-2">
          <Link href="/products"><Button variant="outline" size="sm">Back</Button></Link>
          <PublishButton id={product.id} type="products" isPublished={product.isPublished} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Type</span><span>{product.type}</span></div><div className="flex justify-between"><span className="text-muted">Price</span><span>{product.isFree ? "Free" : formatPrice(product.price)}</span></div><div className="flex justify-between"><span className="text-muted">Slug</span><span className="text-muted">{product.slug}</span></div><p className="text-muted pt-2">{product.description}</p></CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Connected Funnel</CardTitle></CardHeader><CardContent><p className="text-sm text-muted mb-3">Connect this product to a funnel to start selling - 95% pour toi après Stripe fees</p><Link href="/funnels"><Button variant="outline" size="sm">Go to Funnels</Button></Link></CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Checkout</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted">Share this checkout link (95% / 5% split)</p><div className="p-3 rounded-xl bg-surface2 border border-border text-xs break-all">{checkoutUrl}</div><CopyLinkButton url={checkoutUrl} /></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatPrice(productOrders.reduce((s, o) => s + o.total, 0))}</p><p className="text-xs text-muted mt-1">From {productOrders.length} orders • 95% creator</p></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

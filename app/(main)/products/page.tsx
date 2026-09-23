import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Plus, MoreHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted mt-1">Manage your digital products</p>
        </div>
        <Link href="/products/new"><Button className="rounded-full"><Plus className="h-4 w-4 mr-2" />New Product</Button></Link>
      </div>

      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-surface3 border border-border flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-muted" />
            </div>
            <h3 className="font-medium mb-2">Your first product starts here</h3>
            <p className="text-sm text-muted mb-6 max-w-sm mx-auto">Create courses, ebooks, templates, coaching offers. Connect them to funnels and start selling.</p>
            <Link href="/products/new"><Button className="rounded-full">Create your first product</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`}>
              <Card className="hover:border-accent/20 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-surface3 border border-border flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${p.isPublished ? "bg-success/10 text-success border-success/20" : "bg-surface2 text-muted border-border"}`}>{p.isPublished ? "Published" : "Draft"}</span>
                  </div>
                  <h3 className="font-medium mb-1 truncate">{p.title}</h3>
                  <p className="text-xs text-muted mb-3 line-clamp-2">{p.description || "No description"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.isFree ? "Free" : formatPrice(p.price)}</span>
                    <span className="text-[11px] text-muted uppercase">{p.type}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

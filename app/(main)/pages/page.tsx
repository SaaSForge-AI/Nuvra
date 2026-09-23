import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export default async function PagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const pages = await prisma.page.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">Pages</h1><p className="text-sm text-muted mt-1">Landing pages & sales pages builder</p></div>
        <Link href="/pages/new"><Button className="rounded-full"><Plus className="h-4 w-4 mr-2" />New Page</Button></Link>
      </div>

      {pages.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center"><div className="h-12 w-12 rounded-2xl bg-surface3 border border-border flex items-center justify-center mx-auto mb-4"><FileText className="h-6 w-6 text-muted" /></div><h3 className="font-medium mb-2">Build your first page</h3><p className="text-sm text-muted mb-6 max-w-sm mx-auto">Drag & drop builder with hero, pricing, testimonials, checkout blocks</p><Link href="/pages/new"><Button className="rounded-full">Create page</Button></Link></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <Link key={p.id} href={`/pages/${p.id}`}>
              <Card className="hover:border-accent/20 transition-colors"><CardContent className="p-5"><h3 className="font-medium mb-1">{p.title}</h3><p className="text-xs text-muted mb-3">{p.slug}</p><div className="flex justify-between text-xs"><span className="text-muted">{p.views} views</span><span className={`px-2 py-0.5 rounded-full border ${p.isPublished ? "bg-success/10 text-success border-success/20" : "bg-surface2 text-muted"}`}>{p.isPublished ? "Published" : "Draft"}</span></div></CardContent></Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

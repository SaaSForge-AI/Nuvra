import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PublishButton } from "@/components/ui/action-buttons";

export default async function PageBuilder({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const page = await prisma.page.findUnique({ where: { id: params.id }, include: { blocks: true } });
  if (!page || page.userId !== user?.id) return notFound();

  const blocks = page.content ? JSON.parse(page.content) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{page.title}</h1>
        <div className="flex gap-2">
          <Link href={`/p/${page.slug}`} target="_blank"><Button variant="outline" size="sm">Preview</Button></Link>
          <PublishButton id={page.id} type="pages" isPublished={page.isPublished} />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card><CardHeader><CardTitle className="text-sm">Blocks</CardTitle></CardHeader><CardContent className="space-y-2 text-xs">
            {["hero","text","image","video","cta","form","pricing","testimonials","faq","features","countdown","product","checkout","social_proof","logo_cloud"].map((b) => (
              <div key={b} className="p-2 rounded-lg bg-surface2 border border-border hover:border-accent/20 cursor-pointer">{b}</div>
            ))}
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Info</CardTitle></CardHeader><CardContent className="text-xs text-muted space-y-2"><p>Slug: /p/{page.slug}</p><p>Contenu JSON éditable - builder visuel drag & drop en roadmap, fonctionnel via API pour l'instant.</p><p className="text-[11px]">95% creator revenue sur les ventes via cette page • Public at /p/{page.slug}</p></CardContent></Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="min-h-[600px]"><CardContent className="p-6">
            <div className="space-y-4">
              {blocks.map((block: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-surface2">
                  <p className="text-xs text-muted uppercase mb-2">{block.type}</p>
                  <p className="text-sm font-medium">{block.content?.title || block.type}</p>
                  <p className="text-xs text-muted">{block.content?.subtitle || ""}</p>
                </div>
              ))}
              {blocks.length === 0 && <div className="text-center py-20 text-muted text-sm">Drag blocks here to build your page. Autosave enabled. (Phase builder visuel à venir)</div>}
            </div>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}

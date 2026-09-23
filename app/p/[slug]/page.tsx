import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || !page.isPublished) return notFound();

  await prisma.page.update({ where: { id: page.id }, data: { views: { increment: 1 } } });
  await prisma.event.create({ data: { type: "page_view", entityId: page.id } });

  const blocks = page.content ? JSON.parse(page.content) : [];

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {blocks.map((b: any, i: number) => (
          <div key={i} className="p-8 rounded-2xl border border-border bg-surface">
            <h2 className="text-2xl font-semibold mb-2">{b.content?.title || b.type}</h2>
            <p className="text-muted">{b.content?.subtitle || ""}</p>
            {b.type === "cta" && <Link href="/checkout"><Button className="mt-4 rounded-full">{b.content?.cta || "Get Started"}</Button></Link>}
          </div>
        ))}
        {blocks.length === 0 && <div><h1 className="text-3xl font-semibold">{page.title}</h1><p className="text-muted mt-2">{page.description}</p></div>}
      </div>
    </div>
  );
}

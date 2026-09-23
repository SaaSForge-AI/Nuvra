import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PublicFunnel({ params }: { params: { slug: string } }) {
  const funnel = await prisma.funnel.findUnique({ where: { slug: params.slug }, include: { steps: { orderBy: { position: "asc" } } } });
  if (!funnel || !funnel.isPublished) return notFound();

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-2xl mx-auto p-6 space-y-6 pt-20">
        <h1 className="text-3xl font-semibold text-center">{funnel.name}</h1>
        <p className="text-center text-muted">{funnel.description}</p>
        <div className="space-y-4">
          {funnel.steps.map((step, i) => (
            <Card key={step.id}><CardContent className="p-6"><p className="text-sm font-medium mb-1">Step {i + 1}: {step.name}</p><p className="text-xs text-muted">{step.type}</p><Link href={step.type === "CHECKOUT" ? `/checkout/${funnel.id}` : "#"}><Button size="sm" className="mt-3 rounded-full w-full">Continue</Button></Link></CardContent></Card>
          ))}
        </div>
      </div>
    </div>
  );
}

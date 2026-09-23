import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LinkInBioPublic({ params }: { params: { username: string } }) {
  let username = params.username;
  // Strip @ if present
  username = username.replace(/^@/, "");
  
  const linkInBio = await prisma.linkInBio.findFirst({ where: { username } });
  if (!linkInBio) {
    // Try finding by user username
    const userByUsername = await prisma.user.findFirst({ where: { username } });
    if (!userByUsername) return notFound();
    const lib = await prisma.linkInBio.findUnique({ where: { userId: userByUsername.id } });
    if (!lib) return notFound();
    return LinkInBioContent({ linkInBio: lib, username });
  }

  return LinkInBioContent({ linkInBio, username });
}

async function LinkInBioContent({ linkInBio, username }: { linkInBio: any; username: string }) {
  const user = await prisma.user.findUnique({ where: { id: linkInBio.userId } });
  const products = await prisma.product.findMany({ where: { userId: linkInBio.userId, isPublished: true } });
  const courses = await prisma.course.findMany({ where: { userId: linkInBio.userId, status: "PUBLISHED" } });

  await prisma.linkInBio.update({ where: { id: linkInBio.id }, data: { views: { increment: 1 } } });

  return (
    <div className="min-h-screen bg-background flex justify-center p-6">
      <div className="w-full max-w-[480px] space-y-6">
        <div className="text-center pt-12">
          <div className="h-20 w-20 rounded-full bg-accent mx-auto flex items-center justify-center text-white text-2xl font-semibold mb-4">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <h1 className="text-xl font-semibold">{linkInBio.displayName || `${user?.firstName} ${user?.lastName}`}</h1>
          <p className="text-sm text-muted mt-2">{linkInBio.bio}</p>
        </div>

        <div className="space-y-3">
          <Card><CardContent className="p-4 text-center"><p className="text-sm font-medium">Welcome to my Nuvra page</p><p className="text-xs text-muted mt-1">Create. Sell. Teach. Scale.</p></CardContent></Card>

          {products.map((p: any) => (
            <Link key={p.id} href={`/checkout/${p.id}`}><Card className="hover:border-accent/20 transition-colors"><CardContent className="p-4 flex justify-between items-center"><div><p className="font-medium text-sm">{p.title}</p><p className="text-xs text-muted">{p.type}</p></div><Button size="sm" className="rounded-full">View</Button></CardContent></Card></Link>
          ))}

          {courses.map((c: any) => (
            <Link key={c.id} href={`/marketplace/${c.slug}`}><Card className="hover:border-accent/20 transition-colors"><CardContent className="p-4 flex justify-between items-center"><div><p className="font-medium text-sm">{c.title}</p><p className="text-xs text-muted">{c.category}</p></div><Button size="sm" variant="outline" className="rounded-full">Learn</Button></CardContent></Card></Link>
          ))}

          <Card><CardContent className="p-4"><p className="text-sm font-medium mb-2">Newsletter</p><div className="flex gap-2"><input placeholder="Your email" className="flex-1 h-10 rounded-xl border border-border bg-surface2 px-3 text-sm" /><Button size="sm">Join</Button></div></CardContent></Card>
        </div>

        <p className="text-center text-[11px] text-muted">Powered by Nuvra • Create. Sell. Teach. Scale.</p>
      </div>
    </div>
  );
}

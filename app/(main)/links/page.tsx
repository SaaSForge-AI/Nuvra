import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SaveLinksButton } from "@/components/links/links-client";

export default async function LinksPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const linkInBio = await prisma.linkInBio.findUnique({ where: { userId: user.id } });
  const blocks = linkInBio?.blocks ? JSON.parse(linkInBio.blocks) : ["profile","socials","links","products","courses","video","newsletter","cta"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Link in Bio</h1><p className="text-sm text-muted mt-1">Your /@{user.username || user.id.slice(0,6)} public page • 95% revenue sur ventes</p></div><Link href={`/@${user.username || user.id}`} target="_blank"><Button variant="outline" size="sm">View Public Page</Button></Link></div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader><CardContent className="space-y-4"><div className="h-20 w-20 rounded-full bg-accent mx-auto flex items-center justify-center text-white text-xl">{user.firstName?.[0]}</div><p className="text-center font-medium">{user.firstName} {user.lastName}</p><p className="text-center text-sm text-muted">{linkInBio?.bio || "Creator on Nuvra - 95% creator"}</p><div className="space-y-2 text-sm"><div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Products (95%)</span><span className="text-muted">→</span></div><div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Courses (95%)</span><span className="text-muted">→</span></div><div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Academy Resell (90%)</span><span className="text-success">→ 171€</span></div></div></CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Blocks</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="text-muted text-xs mb-3">Tes blocs link-in-bio. Sauvegarde fonctionnelle - drag & drop visuel en roadmap. Public sur /@{user.username}.</p>{blocks.map((b: string) => (<div key={b} className="p-3 rounded-xl bg-surface2 border border-border flex justify-between items-center"><span className="capitalize">{b}</span><span className="text-[11px] px-2 py-1 rounded-full bg-success/10 text-success border border-success/20">Visible</span></div>))}<SaveLinksButton initialBlocks={blocks} /></CardContent></Card>
      </div>
    </div>
  );
}

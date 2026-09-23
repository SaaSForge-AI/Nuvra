import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LinksPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const linkInBio = await prisma.linkInBio.findUnique({ where: { userId: user.id } });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Link in Bio</h1><p className="text-sm text-muted mt-1">Your /@{user.username} public page</p></div><Link href={`/@${user.username}`} target="_blank"><Button variant="outline" size="sm">View Public Page</Button></Link></div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader><CardContent className="space-y-4"><div className="h-20 w-20 rounded-full bg-accent mx-auto flex items-center justify-center text-white text-xl">{user.firstName?.[0]}</div><p className="text-center font-medium">{user.firstName} {user.lastName}</p><p className="text-center text-sm text-muted">{linkInBio?.bio || "Creator on Nuvra"}</p><div className="space-y-2 text-sm"><div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Products</span><span className="text-muted">→</span></div><div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Courses</span><span className="text-muted">→</span></div><div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Newsletter</span><span className="text-muted">→</span></div></div></CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Blocks</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="text-muted text-xs mb-3">Drag to reorder - profile, socials, links, products, formations, videos, newsletter, CTA. Connect to funnel.</p>{["profile","socials","links","products","courses","video","newsletter","cta"].map((b) => (<div key={b} className="p-3 rounded-xl bg-surface2 border border-border flex justify-between items-center"><span className="capitalize">{b}</span><span className="text-[11px] px-2 py-1 rounded-full bg-surface3 border border-border">Visible</span></div>))}<Button size="sm" className="w-full mt-4">Save</Button></CardContent></Card>
      </div>
    </div>
  );
}

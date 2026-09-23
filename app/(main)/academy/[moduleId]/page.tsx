import { academyModules } from "@/lib/academy/content";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ModulePage({ params }: { params: { moduleId: string } }) {
  const mod = academyModules.find((m) => m.id === params.moduleId);
  if (!mod) return notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/academy"><Button variant="ghost" size="sm">← Back to Academy</Button></Link>
      <div><h1 className="text-2xl font-semibold">{mod.title}</h1><p className="text-sm text-muted mt-2">{mod.description}</p></div>

      <div className="grid gap-4">
        {mod.lessons.map((lesson, idx) => (
          <Card key={lesson.id} className="hover:border-accent/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-surface3 border border-border flex items-center justify-center text-xs">{idx + 1}</div><CardTitle className="text-sm">{lesson.title}</CardTitle></div>
              <Button size="sm" variant="outline">Start</Button>
            </CardHeader>
            <CardContent><p className="text-sm text-muted leading-relaxed">{lesson.content}</p><div className="mt-4 p-3 rounded-xl bg-surface2 border border-border text-xs text-muted"><strong>Key takeaway:</strong> Apply this immediately. Document your action.</div></CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-accentMuted border-accent/20"><CardContent className="p-6 flex justify-between items-center"><div><p className="font-medium">Module completed?</p><p className="text-sm text-muted">Mark as complete to unlock next module</p></div><Button>Mark complete</Button></CardContent></Card>
    </div>
  );
}

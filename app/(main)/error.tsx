"use client";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="border-danger/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Une erreur est survenue</h2>
          <p className="text-sm text-muted mb-2">{error.message}</p>
          {error.message.includes("DATABASE_URL") && <p className="text-xs text-warning mb-4">Sur Vercel, vérifie DATABASE_URL dans Settings → Environment Variables puis Redeploy.</p>}
          <p className="text-xs text-muted mb-6">Si l'erreur persiste, vérifie les logs Vercel ou contacte support.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => reset()} className="rounded-full">Réessayer</Button>
            <Button variant="outline" onClick={() => window.location.href = "/dashboard"} className="rounded-full">Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

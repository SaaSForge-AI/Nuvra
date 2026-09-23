"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON login response:", text.slice(0,300));
        throw new Error(text.includes("<!DOCTYPE") ? "Erreur serveur - DB non configurée sur Vercel. Vérifie DATABASE_URL et redéploie. (Erreur <!DOCTYPE>)" : "Erreur serveur - réponse invalide");
      }
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (!data.onboardingDone) router.push("/onboarding");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center font-bold">N</div>
            <span className="font-semibold">NUVRA</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted mt-2">Sign in to your Nuvra workspace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-sm text-danger">{error}</div>
              )}
              <div>
                <label className="text-[13px] font-medium mb-1.5 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label className="text-[13px] font-medium mb-1.5 block">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 text-center text-[13px] text-muted">
              Don't have an account?{" "}
              <Link href="/register" className="text-accent hover:underline">
                Sign up
              </Link>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-surface2 border border-border text-[12px] text-muted">
              <p className="font-medium text-white mb-1">Demo accounts (after seed):</p>
              <p>admin@nuvra.com / admin123</p>
              <p>creator@nuvra.com / creator123</p>
              <p>student@nuvra.com / student123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

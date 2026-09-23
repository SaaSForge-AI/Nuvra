"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await postJson("/api/auth/register", form, "Inscription impossible");
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center font-bold">N</div>
            <span className="font-semibold">NUVRA</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Create your Nuvra account</h1>
          <p className="text-sm text-muted mt-2">Start building your business today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign up</CardTitle>
            <CardDescription>Free to start, no credit card required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-sm text-danger">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium mb-1.5 block">First name</label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Alex" required />
                </div>
                <div>
                  <label className="text-[13px] font-medium mb-1.5 block">Last name</label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Morgan" required />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium mb-1.5 block">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" required />
              </div>
              <div>
                <label className="text-[13px] font-medium mb-1.5 block">Password</label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required minLength={8} />
                <p className="text-[11px] text-muted mt-1">Min 8 characters</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-6 text-center text-[13px] text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </div>
            <p className="mt-6 text-[11px] text-muted text-center">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

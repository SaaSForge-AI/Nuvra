"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const activities = ["Creator", "Coach", "Entrepreneur", "Agency", "Freelancer", "Other"];
const goals = [
  "Vendre mes produits",
  "Créer des formations",
  "Revendre Nuvra Academy",
  "Construire mon audience",
  "Tout faire avec Nuvra",
];
const usageTypes = ["Just starting", "Have audience", "Already selling", "Scaling to 6-figures"];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ activity: "", goal: "", usageType: "", firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function complete() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[560px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center font-bold">N</div>
          <span className="font-semibold">NUVRA</span>
          <span className="ml-4 text-xs text-muted">Step {step} of 3</span>
        </div>

        <div className="w-full h-1 bg-surface2 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <Card className="animate-fade-in">
            <CardContent className="p-8">
              <h1 className="text-xl font-semibold mb-2">What do you do?</h1>
              <p className="text-sm text-muted mb-6">This helps us personalize your experience</p>
              <div className="grid grid-cols-2 gap-3">
                {activities.map((a) => (
                  <button
                    key={a}
                    onClick={() => setData({ ...data, activity: a })}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      data.activity === a ? "border-accent bg-accentMuted text-white" : "border-border bg-surface2 hover:border-borderSubtle text-muted hover:text-white"
                    )}
                  >
                    <span className="text-sm font-medium">{a}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full mt-6" disabled={!data.activity} onClick={() => setStep(2)}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-fade-in">
            <CardContent className="p-8">
              <h1 className="text-xl font-semibold mb-2">What's your main goal?</h1>
              <p className="text-sm text-muted mb-6">Choose what you want to achieve with Nuvra</p>
              <div className="space-y-3">
                {goals.map((g) => (
                  <button
                    key={g}
                    onClick={() => setData({ ...data, goal: g })}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                      data.goal === g ? "border-accent bg-accentMuted text-white" : "border-border bg-surface2 hover:border-borderSubtle text-muted hover:text-white"
                    )}
                  >
                    <span className="text-sm font-medium">{g}</span>
                    {data.goal === g && <span className="text-accent">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!data.goal} onClick={() => setStep(3)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-fade-in">
            <CardContent className="p-8">
              <h1 className="text-xl font-semibold mb-2">Where are you now?</h1>
              <p className="text-sm text-muted mb-6">We’ll tailor your dashboard</p>
              <div className="space-y-3">
                {usageTypes.map((u) => (
                  <button
                    key={u}
                    onClick={() => setData({ ...data, usageType: u })}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      data.usageType === u ? "border-accent bg-accentMuted text-white" : "border-border bg-surface2 hover:border-borderSubtle text-muted hover:text-white"
                    )}
                  >
                    <span className="text-sm font-medium">{u}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" disabled={!data.usageType || loading} onClick={complete}>
                  {loading ? "Setting up..." : "Complete setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { DashboardWrapper } from "@/components/dashboard-wrapper";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboardingDone) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="lg:pl-[260px]">
        <DashboardWrapper>{children}</DashboardWrapper>
      </div>
      <MobileNav user={user} />
    </div>
  );
}

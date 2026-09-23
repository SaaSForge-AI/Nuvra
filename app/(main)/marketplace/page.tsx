import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Star, Users } from "lucide-react";
import { MarketplaceSearch } from "@/components/marketplace/search";

export default async function MarketplacePage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const where: any = { status: "PUBLISHED" };
  if (searchParams.q) where.title = { contains: searchParams.q };
  if (searchParams.category) where.category = searchParams.category;

  const coursesRaw = await prisma.course.findMany({
    where,
    include: { user: true, marketplaceListing: true, enrollments: true, reviews: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Filter approved listings (if listing exists, must be approved; if no listing, allow published courses - for backward compat)
  const courses = coursesRaw.filter((c: any) => {
    if (!c.marketplaceListing) return true;
    return c.marketplaceListing.isApproved;
  }).slice(0,24);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-xl font-semibold">Marketplace</h1><p className="text-sm text-muted mt-1">Discover courses from creators</p></div>

      <div className="flex flex-col md:flex-row gap-4">
        <MarketplaceSearch />
        <div className="flex gap-2 flex-wrap">
          {["All", "Business", "Marketing", "Design", "Tech"].map((cat) => (
            <Link key={cat} href={cat === "All" ? "/marketplace" : `/marketplace?category=${cat}`}><Button variant={searchParams.category === cat ? "default" : "outline"} size="sm" className="rounded-full">{cat}</Button></Link>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted">No courses found. Be the first to publish!</p><Link href="/courses/new"><Button className="mt-4 rounded-full">Create Course</Button></Link></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const avgRating = course.reviews.length ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1) : null;
            return (
              <Link key={course.id} href={`/marketplace/${course.slug}`}>
                <Card className="hover:border-accent/20 transition-colors group overflow-hidden">
                  <div className="h-44 bg-surface3 border-b border-border flex items-center justify-center relative">
                    <span className="text-muted text-sm">{course.title.slice(0, 2).toUpperCase()}</span>
                    {course.isFree && <span className="absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full bg-success text-white">Free</span>}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2"><span className="text-[11px] px-2 py-0.5 rounded-full bg-surface2 border border-border text-muted">{course.category}</span><span className="text-[11px] text-muted">{course.level}</span></div>
                    <h3 className="font-medium mb-1 line-clamp-2 group-hover:text-accent transition-colors">{course.title}</h3>
                    <p className="text-xs text-muted mb-3 line-clamp-2">{course.shortDesc || course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-muted"><span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollments.length}</span>{avgRating && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{avgRating}</span>}</div>
                      <span className="text-sm font-semibold">{course.isFree ? "Free" : formatPrice(course.price)}</span>
                    </div>
                    <p className="text-[11px] text-muted mt-2">by {course.user.firstName} {course.user.lastName}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

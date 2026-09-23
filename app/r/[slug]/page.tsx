import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export default async function ResellerRedirect({ params }: { params: { slug: string } }) {
  const reseller = await prisma.reseller.findFirst({ where: { customSlug: params.slug, status: "ACTIVE" } });
  if (!reseller) return notFound();

  // Track click
  await prisma.event.create({ data: { type: "page_view", entityId: reseller.id, metadata: JSON.stringify({ reseller: params.slug }) } });

  // Redirect to checkout for Nuvra Academy
  const academy = await prisma.course.findFirst({ where: { isNuvraAcademy: true } });
  if (!academy) return notFound();

  redirect(`/checkout/${academy.id}?reseller=${params.slug}`);
}

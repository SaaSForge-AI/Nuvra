import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { calculateResellerSplit, calculateCreatorRevenue } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, courseId, resellerCode, affiliateCode, customerEmail } = body;

  let product: any = null;
  let course: any = null;
  let amount = 0;
  let title = "Product";
  let ownerId = "";
  let isNuvraAcademyResell = false;
  let reseller: any = null;

  if (productId) {
    product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    amount = product.price;
    title = product.title;
    ownerId = product.userId;
  } else if (courseId) {
    course = await prisma.course.findUnique({ where: { id: courseId }, include: { user: true } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    amount = course.price;
    title = course.title;
    ownerId = course.userId;
    isNuvraAcademyResell = course.isNuvraAcademy;
  }

  // Check reseller
  if (resellerCode) {
    reseller = await prisma.reseller.findFirst({ where: { customSlug: resellerCode, status: "ACTIVE" } });
  }

  // If free product, directly create order and enrollment
  if (amount === 0) {
    const session = await getSession();
    const userId = session?.id;

    const order = await prisma.order.create({
      data: {
        userId,
        ownerId,
        total: 0,
        subtotal: 0,
        status: "PAID",
        customerId: null,
      },
    });

    if (courseId && userId) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {},
        create: { userId, courseId, progress: 0 },
      });
    }

    return NextResponse.json({ success: true, free: true, orderId: order.id });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkout = await createCheckoutSession({
    productTitle: title,
    amount,
    successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}/marketplace`,
    customerEmail,
    metadata: {
      productId: productId || "",
      courseId: courseId || "",
      ownerId,
      resellerId: reseller?.id || "",
      affiliateCode: affiliateCode || "",
      isNuvraAcademy: isNuvraAcademyResell ? "1" : "0",
    },
  });

  // Track checkout started
  await prisma.event.create({
    data: {
      type: "checkout_started",
      entityId: productId || courseId,
      metadata: JSON.stringify({ amount, resellerCode, affiliateCode }),
    },
  }).catch(()=>{});

  return NextResponse.json({ ...checkout, resellerId: reseller?.id || null });
}

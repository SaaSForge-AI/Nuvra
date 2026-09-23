import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateResellerSplit, calculateCreatorRevenue } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, productId, courseId } = body;
    
    // Only allow mock sessions
    if (!sessionId?.includes("mock")) {
      return NextResponse.json({ error: "Only mock sessions allowed here, real Stripe uses webhook" }, { status: 400 });
    }

    const session = await getSession();
    const buyerEmail = session ? (await prisma.user.findUnique({ where: { id: session.id } }))?.email : body.customerEmail;
    const buyerUserId = session?.id;

    let amount = 0;
    let ownerId = "";
    let title = "";
    let isNuvraAcademy = false;
    let resellerId = body.resellerId || "";

    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      amount = product.price;
      ownerId = product.userId;
      title = product.title;
    } else if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
      amount = course.price;
      ownerId = course.userId;
      title = course.title;
      isNuvraAcademy = !!course.isNuvraAcademy;
    }

    if (!ownerId) return NextResponse.json({ error: "No owner" }, { status: 400 });

    // Check existing order to avoid duplicate
    const existing = await prisma.order.findFirst({ where: { stripeSessionId: sessionId } });
    if (existing) {
      return NextResponse.json({ success: true, orderId: existing.id, existing: true });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: buyerUserId,
        ownerId,
        total: amount,
        subtotal: amount,
        status: "PAID",
        stripeSessionId: sessionId,
        currency: "usd",
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount,
        status: "SUCCEEDED",
        stripeId: sessionId,
        method: "card",
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        userId: ownerId,
        orderId: order.id,
        type: "SALE",
        amount,
        description: `Sale of ${title} (mock)`,
      },
    });

    if (isNuvraAcademy && resellerId) {
      const split = calculateResellerSplit(amount);
      const resellerRecord = await prisma.reseller.findUnique({ where: { id: resellerId } });
      const resellerUserId = resellerRecord?.userId;

      await prisma.resellerSale.create({
        data: {
          resellerId,
          orderId: order.id,
          productPrice: split.price,
          stripeFees: split.stripeFees,
          nuvraShare: split.nuvraShare,
          resellerShare: split.resellerShare,
          netAmount: split.net,
        },
      });

      await prisma.reseller.update({
        where: { id: resellerId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: amount },
          totalCommission: { increment: split.resellerShare },
        },
      });

      if (resellerUserId) {
        await prisma.ledgerEntry.create({
          data: {
            userId: resellerUserId,
            orderId: order.id,
            type: "COMMISSION",
            amount: split.resellerShare,
            description: "Reseller commission 90% - Academy 197$ mock",
          },
        });
      }
      await prisma.ledgerEntry.create({
        data: {
          userId: resellerUserId,
          orderId: order.id,
          type: "FEE",
          amount: split.stripeFees,
          description: "Stripe fees",
        },
      });
      await prisma.ledgerEntry.create({
        data: {
          userId: ownerId,
          orderId: order.id,
          type: "COMMISSION",
          amount: split.nuvraShare,
          description: "Nuvra 10%",
        },
      });
    } else {
      const rev = calculateCreatorRevenue(amount);
      await prisma.ledgerEntry.create({
        data: {
          userId: ownerId,
          orderId: order.id,
          type: "COMMISSION",
          amount: rev.creatorShare,
          description: "Creator 95%",
        },
      });
      await prisma.ledgerEntry.create({
        data: {
          userId: ownerId,
          orderId: order.id,
          type: "COMMISSION",
          amount: rev.nuvraShare,
          description: "Nuvra 5%",
        },
      });
      await prisma.ledgerEntry.create({
        data: {
          userId: ownerId,
          orderId: order.id,
          type: "FEE",
          amount: rev.stripeFees,
          description: "Stripe fees",
        },
      });
    }

    if (courseId && buyerUserId) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: buyerUserId, courseId } },
        update: {},
        create: { userId: buyerUserId, courseId, progress: 0 },
      });
    }

    await prisma.event.create({
      data: {
        type: "purchase_completed",
        userId: buyerUserId,
        entityId: order.id,
        metadata: JSON.stringify({ amount, productId, courseId, mock: true }),
      },
    });

    await prisma.notification.create({
      data: {
        userId: ownerId,
        type: "NEW_SALE",
        title: "New sale! 💰",
        message: `You made a sale of ${amount / 100}€ (mock)`,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (e: any) {
    console.error("Confirm error", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { calculateResellerSplit, calculateCreatorRevenue } from "@/lib/utils";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: any;

  // If stripe not configured, handle mock
  if (!stripe || !signature) {
    // Mock handling - check for mock query
    try {
      const json = JSON.parse(body);
      if (json.mock) {
        // Handle mock purchase
        await handleSuccessfulPayment(json);
        return NextResponse.json({ received: true, mock: true });
      }
    } catch {}
    return NextResponse.json({ error: "Stripe not configured, but mock allowed" }, { status: 200 });
  }

  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.error("Webhook signature verification failed", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await handleSuccessfulPayment({
      stripeSessionId: session.id,
      amount: session.amount_total,
      customerEmail: session.customer_email,
      metadata: session.metadata,
    });
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(data: any) {
  const { stripeSessionId, amount, customerEmail, metadata } = data;
  const productId = metadata?.productId;
  const courseId = metadata?.courseId;
  const ownerId = metadata?.ownerId;
  const resellerId = metadata?.resellerId;
  const isNuvraAcademy = metadata?.isNuvraAcademy === "1";

  if (!ownerId) return;

  // Find or create customer user
  let buyerUser = null;
  if (customerEmail) {
    buyerUser = await prisma.user.findUnique({ where: { email: customerEmail } });
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: buyerUser?.id,
      ownerId,
      total: amount || 0,
      subtotal: amount || 0,
      status: "PAID",
      stripeSessionId,
      currency: "usd",
    },
  });

  // Create payment
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: amount || 0,
      status: "SUCCEEDED",
      stripeId: stripeSessionId,
      method: "card",
    },
  });

  // Ledger - SALE
  await prisma.ledgerEntry.create({
    data: {
      userId: ownerId,
      orderId: order.id,
      type: "SALE",
      amount: amount || 0,
      description: `Sale of ${productId || courseId}`,
      metadata: JSON.stringify({ productId, courseId, resellerId }),
    },
  });

  // Handle Nuvra Academy resell 90/10
  if (isNuvraAcademy && resellerId) {
    const split = calculateResellerSplit(amount);
    
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

    // Update reseller stats
    await prisma.reseller.update({
      where: { id: resellerId },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: amount },
        totalCommission: { increment: split.resellerShare },
      },
    });

    // Ledger entries for split
    await prisma.ledgerEntry.create({
      data: {
        userId: resellerId,
        orderId: order.id,
        type: "COMMISSION",
        amount: split.resellerShare,
        description: "Reseller commission 90%",
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        type: "FEE",
        amount: split.stripeFees,
        description: "Stripe fees",
        orderId: order.id,
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        type: "COMMISSION",
        amount: split.nuvraShare,
        description: "Nuvra platform share 10%",
        orderId: order.id,
      },
    });

    // Notification to reseller
    const resellerUser = await prisma.reseller.findUnique({ where: { id: resellerId }, include: { user: true } });
    if (resellerUser) {
      await prisma.notification.create({
        data: {
          userId: resellerUser.userId,
          type: "RESELLER_SALE",
          title: "New reseller sale! 🎉",
          message: `You earned ${split.resellerShare / 100} from Nuvra Academy`,
        },
      });
    }
  } else {
    // Creator 100% after fees
    const rev = calculateCreatorRevenue(amount);
    await prisma.ledgerEntry.create({
      data: {
        userId: ownerId,
        orderId: order.id,
        type: "COMMISSION",
        amount: rev.net,
        description: "Creator revenue 100% after fees",
      },
    });
  }

  // Enrollment if course
  if (courseId && buyerUser) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: buyerUser.id, courseId } },
      update: {},
      create: { userId: buyerUser.id, courseId, progress: 0 },
    });

    await prisma.event.create({
      data: { type: "course_started", userId: buyerUser.id, entityId: courseId },
    });
  }

  // Event tracking
  await prisma.event.create({
    data: {
      type: "purchase_completed",
      userId: buyerUser?.id,
      entityId: order.id,
      metadata: JSON.stringify({ amount, productId, courseId }),
    },
  });

  // Notification to owner
  await prisma.notification.create({
    data: {
      userId: ownerId,
      type: "NEW_SALE",
      title: "New sale! 💰",
      message: `You made a sale of ${amount / 100}`,
      link: `/payments`,
    },
  });

  // Send email
  if (customerEmail) {
    const productTitle = courseId ? "Course" : "Product";
    const tmpl = emailTemplates.purchaseConfirmation(productTitle, customerEmail.split("@")[0]);
    await sendEmail({ to: customerEmail, subject: tmpl.subject, html: tmpl.html });
  }
}

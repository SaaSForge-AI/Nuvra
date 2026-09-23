import { prisma } from "./db";

export type EventType =
  | "page_view"
  | "lead_created"
  | "checkout_started"
  | "checkout_completed"
  | "purchase_completed"
  | "course_started"
  | "lesson_completed"
  | "course_completed"
  | "reseller_sale"
  | "affiliate_sale"
  | "user_created";

export async function trackEvent(params: {
  type: EventType;
  userId?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await prisma.event.create({
      data: {
        type: params.type,
        userId: params.userId,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    // Also trigger automations if needed
    if (params.type) {
      await triggerAutomationsForEvent(params.type, params);
    }
  } catch (e) {
    console.error("Failed to track event", e);
  }
}

async function triggerAutomationsForEvent(type: EventType, data: any) {
  const triggerMap: Record<string, string> = {
    user_created: "USER_CREATED",
    lead_created: "LEAD_CREATED",
    purchase_completed: "PRODUCT_PURCHASED",
    checkout_started: "CHECKOUT_ABANDONED",
    course_started: "COURSE_STARTED",
    lesson_completed: "LESSON_COMPLETED",
    course_completed: "COURSE_COMPLETED",
    reseller_sale: "RESELLER_APPROVED",
    affiliate_sale: "AFFILIATE_SALE",
  };

  const triggerType = triggerMap[type];
  if (!triggerType) return;

  // Find automations with this trigger
  const automations = await prisma.automation.findMany({
    where: { triggerType: triggerType as any, isActive: true },
    include: { actions: true },
  });

  for (const automation of automations) {
    // Execute actions (simplified)
    for (const action of automation.actions) {
      console.log(`[AUTOMATION] Executing ${action.type} for ${automation.name}`);
      // Real execution would be handled by a queue
    }
  }
}

export async function getAnalytics(userId: string, period: string = "30d") {
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  const events = await prisma.event.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
  });

  const orders = await prisma.order.findMany({
    where: {
      ownerId: userId,
      createdAt: { gte: startDate },
      status: "PAID",
    },
  });

  const leads = await prisma.lead.count({
    where: { userId, createdAt: { gte: startDate } },
  });

  const pageViews = events.filter((e) => e.type === "page_view").length;
  const checkouts = events.filter((e) => e.type === "checkout_started").length;
  const purchases = events.filter((e) => e.type === "purchase_completed").length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const conversion = checkouts > 0 ? (purchases / checkouts) * 100 : 0;

  return {
    pageViews,
    leads,
    checkouts,
    purchases,
    revenue,
    conversion,
    avgOrder: purchases > 0 ? revenue / purchases : 0,
    eventsByDay: groupEventsByDay(events, startDate, now),
  };
}

function groupEventsByDay(events: any[], start: Date, end: Date) {
  const days: Record<string, number> = {};
  const curr = new Date(start);
  while (curr <= end) {
    const key = curr.toISOString().split("T")[0];
    days[key] = 0;
    curr.setDate(curr.getDate() + 1);
  }
  events.forEach((e) => {
    const key = new Date(e.createdAt).toISOString().split("T")[0];
    if (days[key] !== undefined) days[key]++;
  });
  return Object.entries(days).map(([date, count]) => ({ date, count }));
}

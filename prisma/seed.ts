import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Nuvra...");

  // Clean
  await prisma.ledgerEntry.deleteMany();
  await prisma.resellerSale.deleteMany();
  await prisma.reseller.deleteMany();
  await prisma.affiliateSale.deleteMany();
  await prisma.affiliateClick.deleteMany();
  await prisma.affiliate.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.order.deleteMany();
  await prisma.funnelStep.deleteMany();
  await prisma.funnel.deleteMany();
  await prisma.pageBlock.deleteMany();
  await prisma.page.deleteMany();
  await prisma.productPrice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.emailCampaign.deleteMany();
  await prisma.automationAction.deleteMany();
  await prisma.automation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.linkInBio.deleteMany();
  await prisma.workspaceMembership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const hash = async (p: string) => bcrypt.hash(p, 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@nuvra.com",
      passwordHash: await hash("admin123"),
      firstName: "Admin",
      lastName: "Nuvra",
      role: "SUPER_ADMIN",
      isSuperAdmin: true,
      emailVerified: true,
      onboardingDone: true,
      username: "admin",
    },
  });

  const creator = await prisma.user.create({
    data: {
      email: "creator@nuvra.com",
      passwordHash: await hash("creator123"),
      firstName: "Alex",
      lastName: "Creator",
      role: "CREATOR",
      emailVerified: true,
      onboardingDone: true,
      username: "alexcreator",
      activity: "Creator",
      goal: "Créer des formations",
      usageType: "Already selling",
    },
  });

  const resellerUser = await prisma.user.create({
    data: {
      email: "reseller@nuvra.com",
      passwordHash: await hash("reseller123"),
      firstName: "Sam",
      lastName: "Reseller",
      role: "RESELLER",
      emailVerified: true,
      onboardingDone: true,
      username: "samreseller",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@nuvra.com",
      passwordHash: await hash("student123"),
      firstName: "Jordan",
      lastName: "Student",
      role: "STUDENT",
      emailVerified: true,
      onboardingDone: true,
      username: "jordanstudent",
    },
  });

  // Profiles
  for (const u of [admin, creator, resellerUser, student]) {
    await prisma.profile.create({ data: { userId: u.id, bio: "Nuvra user" } });
  }

  // Workspaces
  const ws = await prisma.workspace.create({ data: { name: "Alex's Workspace", slug: `alex-workspace-${Date.now()}`, ownerId: creator.id } });
  await prisma.workspaceMembership.create({ data: { userId: creator.id, workspaceId: ws.id, role: "OWNER" } });

  // Link in bio
  await prisma.linkInBio.create({ data: { userId: creator.id, username: "alexcreator", displayName: "Alex Creator", bio: "I help creators scale", blocks: JSON.stringify([]) } });
  await prisma.linkInBio.create({ data: { userId: resellerUser.id, username: "samreseller", displayName: "Sam Reseller", bio: "Reselling Nuvra Academy" } });
  await prisma.linkInBio.create({ data: { userId: student.id, username: "jordanstudent", displayName: "Jordan Student" } });
  await prisma.linkInBio.create({ data: { userId: admin.id, username: "admin", displayName: "Admin" } });

  // Nuvra Academy Course
  const nuvraAcademy = await prisma.course.create({
    data: {
      userId: admin.id,
      title: "Nuvra Academy - Create. Sell. Teach. Scale.",
      description: "The complete system to build a digital business from 0 to 100k. 8 modules, 50+ lessons, templates, and resell rights 90%.",
      shortDesc: "Complete system from 0 to 100k",
      category: "Business",
      level: "beginner",
      price: 49700,
      isFree: false,
      status: "PUBLISHED",
      slug: "nuvra-academy",
      isNuvraAcademy: true,
      learningOutcomes: JSON.stringify(["Build funnel", "Create course", "Sell products", "Automate", "Scale to 100k"]),
    },
  });

  // Academy modules
  const modulesData = [
    { title: "Comprendre l'écosystème digital", pos: 0 },
    { title: "Trouver et définir son offre", pos: 1 },
    { title: "Construire son tunnel", pos: 2 },
    { title: "Créer sa première formation", pos: 3 },
    { title: "Acquisition", pos: 4 },
    { title: "Conversion", pos: 5 },
    { title: "Automatisation", pos: 6 },
    { title: "Croissance", pos: 7 },
  ];

  for (const md of modulesData) {
    const mod = await prisma.courseModule.create({ data: { courseId: nuvraAcademy.id, title: md.title, position: md.pos, isPublished: true } });
    for (let i = 0; i < 3; i++) {
      await prisma.lesson.create({ data: { moduleId: mod.id, title: `${md.title} - Leçon ${i + 1}`, description: "Contenu premium", content: "Contenu détaillé de la leçon...", position: i, isPublished: true, duration: 600 } });
    }
  }

  await prisma.marketplaceListing.create({ data: { courseId: nuvraAcademy.id, isApproved: true, approvedAt: new Date(), featured: true } });

  // Creator course
  const creatorCourse = await prisma.course.create({
    data: {
      userId: creator.id,
      title: "Build Your First Funnel in 7 Days",
      description: "Learn to build high-converting funnels from scratch",
      shortDesc: "Funnel building bootcamp",
      category: "Marketing",
      level: "beginner",
      price: 9900,
      status: "PUBLISHED",
      slug: "build-first-funnel",
    },
  });

  const mod1 = await prisma.courseModule.create({ data: { courseId: creatorCourse.id, title: "Introduction", position: 0, isPublished: true } });
  await prisma.lesson.create({ data: { moduleId: mod1.id, title: "Welcome", description: "Intro", content: "Welcome to course", position: 0, isPublished: true, duration: 300 } });
  await prisma.marketplaceListing.create({ data: { courseId: creatorCourse.id, isApproved: true, approvedAt: new Date() } });

  // Products
  const prod1 = await prisma.product.create({ data: { userId: creator.id, title: "Nuvra Academy Resell", description: "Resell rights", type: "NUVRA_ACADEMY_RESELL", price: 49700, slug: `nuvra-academy-resell-${Date.now()}`, isPublished: true } });
  const prod2 = await prisma.product.create({ data: { userId: creator.id, title: "Funnel Template Pack", description: "10 high-converting templates", type: "TEMPLATE", price: 4900, slug: `funnel-templates-${Date.now()}`, isPublished: true } });

  // Funnels
  const funnel = await prisma.funnel.create({ data: { userId: creator.id, name: "Main Sales Funnel", description: "Primary funnel", slug: `main-funnel-${Date.now()}`, isPublished: true } });
  await prisma.funnelStep.createMany({
    data: [
      { funnelId: funnel.id, type: "LANDING", name: "Landing", position: 0, views: 1240, conversions: 520 },
      { funnelId: funnel.id, type: "LEAD_CAPTURE", name: "Lead Capture", position: 1, views: 520, conversions: 210 },
      { funnelId: funnel.id, type: "SALES", name: "Sales Page", position: 2, views: 210, conversions: 45 },
      { funnelId: funnel.id, type: "CHECKOUT", name: "Checkout", position: 3, views: 45, conversions: 12 },
      { funnelId: funnel.id, type: "THANK_YOU", name: "Thank You", position: 4, views: 12, conversions: 12 },
    ],
  });

  // Page
  const page = await prisma.page.create({ data: { userId: creator.id, title: "Landing - Funnel Course", slug: `landing-funnel-${Date.now()}`, isPublished: true, content: JSON.stringify([{ type: "hero", content: { title: "Build Your First Funnel" } }]) } });

  // Leads & Customers
  await prisma.lead.createMany({
    data: [
      { userId: creator.id, email: "lead1@example.com", firstName: "Lead", lastName: "One", source: "Landing Page", status: "lead" },
      { userId: creator.id, email: "lead2@example.com", firstName: "Lead", lastName: "Two", source: "Instagram", status: "lead" },
    ],
  });

  await prisma.customer.createMany({
    data: [
      { userId: creator.id, email: "customer1@example.com", firstName: "Customer", lastName: "One", totalSpent: 49700, ordersCount: 1, source: "Funnel" },
      { userId: creator.id, email: "customer2@example.com", firstName: "Customer", lastName: "Two", totalSpent: 9900, ordersCount: 1 },
    ],
  });

  // Reseller
  const reseller = await prisma.reseller.create({ data: { userId: resellerUser.id, status: "ACTIVE", activatedAt: new Date(), customSlug: "samreseller", totalSales: 2, totalRevenue: 99400, totalCommission: 86000 } });

  // Orders
  const order1 = await prisma.order.create({ data: { userId: student.id, ownerId: admin.id, total: 49700, subtotal: 49700, status: "PAID", stripeSessionId: "cs_mock_1" } });
  await prisma.payment.create({ data: { orderId: order1.id, amount: 49700, status: "SUCCEEDED", stripeId: "pi_mock_1" } });
  await prisma.ledgerEntry.create({ data: { userId: admin.id, orderId: order1.id, type: "SALE", amount: 49700, description: "Nuvra Academy sale" } });

  // Reseller sale - 90/10
  const splitPrice = 49700;
  const stripeFees = Math.round(splitPrice * 0.029 + 30);
  const afterFees = splitPrice - stripeFees;
  const nuvraShare = Math.round(afterFees * 0.10);
  const resellerShare = afterFees - nuvraShare;

  const order2 = await prisma.order.create({ data: { userId: student.id, ownerId: admin.id, total: splitPrice, subtotal: splitPrice, status: "PAID", stripeSessionId: "cs_mock_reseller" } });
  await prisma.resellerSale.create({ data: { resellerId: reseller.id, orderId: order2.id, productPrice: splitPrice, stripeFees, nuvraShare, resellerShare, netAmount: resellerShare } });
  await prisma.ledgerEntry.create({ data: { userId: resellerUser.id, orderId: order2.id, type: "COMMISSION", amount: resellerShare, description: "90% reseller commission" } });
  await prisma.ledgerEntry.create({ data: { orderId: order2.id, type: "FEE", amount: stripeFees, description: "Stripe fees" } });
  await prisma.ledgerEntry.create({ data: { orderId: order2.id, type: "COMMISSION", amount: nuvraShare, description: "Nuvra 10%" } });

  // Enrollment
  await prisma.enrollment.create({ data: { userId: student.id, courseId: nuvraAcademy.id, progress: 0.24 } });
  await prisma.enrollment.create({ data: { userId: student.id, courseId: creatorCourse.id, progress: 0.5 } });

  // Automations
  await prisma.automation.create({
    data: {
      userId: creator.id,
      name: "Welcome Sequence",
      description: "Send welcome when user signs up",
      triggerType: "USER_CREATED",
      isActive: true,
      actions: { create: [{ type: "SEND_EMAIL", config: JSON.stringify({ template: "welcome" }), position: 0 }] },
    },
  });

  // Events
  await prisma.event.createMany({
    data: [
      { userId: creator.id, type: "page_view" },
      { userId: creator.id, type: "lead_created" },
      { userId: creator.id, type: "checkout_started" },
      { userId: creator.id, type: "purchase_completed" },
    ],
  });

  // Notifications
  await prisma.notification.create({ data: { userId: creator.id, type: "NEW_SALE", title: "New sale! 💰", message: "You made a sale of $497" } });

  // Email campaign
  await prisma.emailCampaign.create({ data: { userId: creator.id, name: "Welcome Broadcast", subject: "Welcome to my list", content: "Hello!", status: "SENT", sentCount: 120 } });

  // Affiliate
  await prisma.affiliate.create({ data: { userId: creator.id, commissionRate: 30, cookieDays: 30, isActive: true } });

  console.log("Seed completed!");
  console.log("Accounts:");
  console.log("admin@nuvra.com / admin123 (SUPER_ADMIN)");
  console.log("creator@nuvra.com / creator123 (CREATOR)");
  console.log("reseller@nuvra.com / reseller123 (RESELLER)");
  console.log("student@nuvra.com / student123 (STUDENT)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

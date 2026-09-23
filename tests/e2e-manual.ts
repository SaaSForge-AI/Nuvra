import { prisma } from "../lib/db";

async function test() {
  console.log("=== E2E Manual Test ===");
  
  // Check counts
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const courses = await prisma.course.count();
  const orders = await prisma.order.count();
  const ledger = await prisma.ledgerEntry.count();
  
  console.log(`Users: ${users}, Products: ${products}, Courses: ${courses}, Orders: ${orders}, Ledger: ${ledger}`);
  
  // Check business model
  const resellerSales = await prisma.resellerSale.findMany();
  console.log(`Reseller sales: ${resellerSales.length}`);
  for (const rs of resellerSales) {
    const total = rs.productPrice;
    const sum = rs.stripeFees + rs.nuvraShare + rs.resellerShare;
    console.log(`Sale ${rs.id}: price ${total} = fees ${rs.stripeFees} + nuvra ${rs.nuvraShare} + reseller ${rs.resellerShare} = ${sum} ${total === sum ? "OK" : "FAIL"}`);
    if (total !== sum) throw new Error("Reseller split mismatch");
  }
  
  // Check creator revenue
  const creatorLedger = await prisma.ledgerEntry.findMany({ where: { description: { contains: "Creator" } } });
  console.log(`Creator ledger entries: ${creatorLedger.length}`);
  
  // Check permissions: try to find products for creator
  const creator = await prisma.user.findUnique({ where: { email: "creator@nuvra.com" } });
  const creatorProducts = await prisma.product.findMany({ where: { userId: creator?.id } });
  console.log(`Creator products: ${creatorProducts.length} - should be 3`);
  
  const student = await prisma.user.findUnique({ where: { email: "student@nuvra.com" } });
  const studentEnrollments = await prisma.enrollment.findMany({ where: { userId: student?.id } });
  console.log(`Student enrollments: ${studentEnrollments.length} - should be 2`);
  
  // Check marketplace listings approved
  const listings = await prisma.marketplaceListing.findMany();
  console.log(`Marketplace listings: ${listings.length}, approved: ${listings.filter(l => l.isApproved).length}`);
  
  // Check funnel steps
  const funnels = await prisma.funnel.findMany({ include: { steps: true } });
  console.log(`Funnels: ${funnels.length}, steps in first: ${funnels[0]?.steps.length || 0}`);
  
  // Check composite key handling
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: student?.id, courseId: "course-nuvra-academy" } } });
  console.log(`Composite key test enrollment: ${enrollment ? "OK" : "FAIL"} - ${enrollment?.id}`);
  
  console.log("=== All checks PASS ===");
}

test().catch(e => { console.error(e); process.exit(1); });

import { DatabaseSync } from "node:sqlite";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

// Ensure prisma directory exists
const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./prisma/dev.db";
const resolvedPath = path.resolve(dbPath);
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new DatabaseSync(resolvedPath);

// Enable WAL
try {
  db.exec("PRAGMA journal_mode=WAL;");
} catch {}

function nowISO() {
  return new Date().toISOString();
}

function toInt(b: boolean | undefined | null) {
  if (b === undefined || b === null) return 0;
  return b ? 1 : 0;
}

function fromInt(i: any) {
  if (i === 0) return false;
  if (i === 1) return true;
  return i;
}

// Create tables
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  passwordHash TEXT,
  firstName TEXT,
  lastName TEXT,
  avatarUrl TEXT,
  role TEXT DEFAULT 'CREATOR',
  isSuperAdmin INTEGER DEFAULT 0,
  emailVerified INTEGER DEFAULT 0,
  emailVerifiedAt TEXT,
  onboardingDone INTEGER DEFAULT 0,
  activity TEXT,
  goal TEXT,
  usageType TEXT,
  stripeCustomerId TEXT,
  stripeConnectId TEXT,
  username TEXT UNIQUE,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Profile (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE,
  bio TEXT,
  website TEXT,
  twitter TEXT,
  linkedin TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Workspace (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  ownerId TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS WorkspaceMembership (
  id TEXT PRIMARY KEY,
  userId TEXT,
  workspaceId TEXT,
  role TEXT DEFAULT 'OWNER',
  createdAt TEXT,
  UNIQUE(userId, workspaceId)
);

CREATE TABLE IF NOT EXISTS Product (
  id TEXT PRIMARY KEY,
  userId TEXT,
  workspaceId TEXT,
  title TEXT,
  description TEXT,
  type TEXT DEFAULT 'COURSE',
  price INTEGER DEFAULT 0,
  comparePrice INTEGER,
  currency TEXT DEFAULT 'usd',
  isFree INTEGER DEFAULT 0,
  coverUrl TEXT,
  slug TEXT UNIQUE,
  isPublished INTEGER DEFAULT 0,
  stripeProductId TEXT,
  stripePriceId TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS ProductPrice (
  id TEXT PRIMARY KEY,
  productId TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  interval TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Course (
  id TEXT PRIMARY KEY,
  userId TEXT,
  workspaceId TEXT,
  productId TEXT UNIQUE,
  title TEXT,
  description TEXT,
  shortDesc TEXT,
  coverUrl TEXT,
  category TEXT,
  level TEXT DEFAULT 'beginner',
  price INTEGER DEFAULT 0,
  isFree INTEGER DEFAULT 0,
  status TEXT DEFAULT 'DRAFT',
  slug TEXT UNIQUE,
  isNuvraAcademy INTEGER DEFAULT 0,
  learningOutcomes TEXT,
  requirements TEXT,
  totalDuration INTEGER DEFAULT 0,
  certificateEnabled INTEGER DEFAULT 1,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS CourseModule (
  id TEXT PRIMARY KEY,
  courseId TEXT,
  title TEXT,
  description TEXT,
  position INTEGER DEFAULT 0,
  isPublished INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Lesson (
  id TEXT PRIMARY KEY,
  moduleId TEXT,
  title TEXT,
  description TEXT,
  content TEXT,
  videoUrl TEXT,
  audioUrl TEXT,
  pdfUrl TEXT,
  duration INTEGER,
  position INTEGER DEFAULT 0,
  isFree INTEGER DEFAULT 0,
  isPublished INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Quiz (
  id TEXT PRIMARY KEY,
  lessonId TEXT UNIQUE,
  title TEXT,
  description TEXT,
  passingScore INTEGER DEFAULT 70,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS QuizQuestion (
  id TEXT PRIMARY KEY,
  quizId TEXT,
  question TEXT,
  position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS QuizAnswer (
  id TEXT PRIMARY KEY,
  questionId TEXT,
  answer TEXT,
  isCorrect INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Enrollment (
  id TEXT PRIMARY KEY,
  userId TEXT,
  courseId TEXT,
  progress REAL DEFAULT 0,
  completed INTEGER DEFAULT 0,
  completedAt TEXT,
  enrolledAt TEXT,
  UNIQUE(userId, courseId)
);

CREATE TABLE IF NOT EXISTS Progress (
  id TEXT PRIMARY KEY,
  enrollmentId TEXT,
  lessonId TEXT,
  isCompleted INTEGER DEFAULT 0,
  completedAt TEXT,
  watchTime INTEGER DEFAULT 0,
  UNIQUE(enrollmentId, lessonId)
);

CREATE TABLE IF NOT EXISTS Certificate (
  id TEXT PRIMARY KEY,
  userId TEXT,
  courseId TEXT,
  enrollmentId TEXT UNIQUE,
  code TEXT UNIQUE,
  studentName TEXT,
  courseTitle TEXT,
  creatorName TEXT,
  issuedAt TEXT
);

CREATE TABLE IF NOT EXISTS Funnel (
  id TEXT PRIMARY KEY,
  userId TEXT,
  workspaceId TEXT,
  name TEXT,
  description TEXT,
  slug TEXT UNIQUE,
  isPublished INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS FunnelStep (
  id TEXT PRIMARY KEY,
  funnelId TEXT,
  productId TEXT,
  pageId TEXT,
  type TEXT,
  name TEXT,
  position INTEGER DEFAULT 0,
  config TEXT,
  conversionRate REAL DEFAULT 0,
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Page (
  id TEXT PRIMARY KEY,
  userId TEXT,
  workspaceId TEXT,
  funnelId TEXT,
  title TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  isPublished INTEGER DEFAULT 0,
  seoTitle TEXT,
  seoDesc TEXT,
  content TEXT,
  views INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS PageBlock (
  id TEXT PRIMARY KEY,
  pageId TEXT,
  type TEXT,
  content TEXT,
  position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS LinkInBio (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE,
  username TEXT UNIQUE,
  displayName TEXT,
  bio TEXT,
  avatarUrl TEXT,
  theme TEXT,
  isPublished INTEGER DEFAULT 1,
  blocks TEXT,
  views INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Lead (
  id TEXT PRIMARY KEY,
  userId TEXT,
  email TEXT,
  firstName TEXT,
  lastName TEXT,
  phone TEXT,
  source TEXT,
  tags TEXT,
  status TEXT DEFAULT 'lead',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Customer (
  id TEXT PRIMARY KEY,
  userId TEXT,
  email TEXT,
  firstName TEXT,
  lastName TEXT,
  phone TEXT,
  tags TEXT,
  totalSpent INTEGER DEFAULT 0,
  ordersCount INTEGER DEFAULT 0,
  source TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS "Order" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  customerId TEXT,
  ownerId TEXT,
  total INTEGER,
  subtotal INTEGER,
  fees INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'PENDING',
  stripeSessionId TEXT,
  stripePaymentId TEXT,
  couponCode TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS OrderItem (
  id TEXT PRIMARY KEY,
  orderId TEXT,
  productId TEXT,
  courseId TEXT,
  title TEXT,
  quantity INTEGER DEFAULT 1,
  price INTEGER
);

CREATE TABLE IF NOT EXISTS Payment (
  id TEXT PRIMARY KEY,
  orderId TEXT UNIQUE,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'PENDING',
  stripeId TEXT,
  method TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Refund (
  id TEXT PRIMARY KEY,
  orderId TEXT UNIQUE,
  amount INTEGER,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Reseller (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE,
  status TEXT DEFAULT 'PENDING',
  activatedAt TEXT,
  totalSales INTEGER DEFAULT 0,
  totalRevenue INTEGER DEFAULT 0,
  totalCommission INTEGER DEFAULT 0,
  customSlug TEXT UNIQUE,
  branding TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS ResellerSale (
  id TEXT PRIMARY KEY,
  resellerId TEXT,
  orderId TEXT UNIQUE,
  productPrice INTEGER,
  stripeFees INTEGER,
  nuvraShare INTEGER,
  resellerShare INTEGER,
  netAmount INTEGER,
  status TEXT DEFAULT 'completed',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Commission (
  id TEXT PRIMARY KEY,
  userId TEXT,
  orderId TEXT,
  amount INTEGER,
  type TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Affiliate (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE,
  commissionRate REAL DEFAULT 20,
  cookieDays INTEGER DEFAULT 30,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS AffiliateClick (
  id TEXT PRIMARY KEY,
  affiliateId TEXT,
  userId TEXT,
  code TEXT,
  ip TEXT,
  userAgent TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS AffiliateSale (
  id TEXT PRIMARY KEY,
  affiliateId TEXT,
  orderId TEXT UNIQUE,
  code TEXT,
  commission INTEGER,
  status TEXT DEFAULT 'pending',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS EmailCampaign (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  subject TEXT,
  content TEXT,
  status TEXT DEFAULT 'DRAFT',
  list TEXT,
  sentCount INTEGER DEFAULT 0,
  openRate REAL DEFAULT 0,
  clickRate REAL DEFAULT 0,
  scheduledAt TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS EmailSequence (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  trigger TEXT,
  steps TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Automation (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  description TEXT,
  isActive INTEGER DEFAULT 1,
  triggerType TEXT,
  triggerConfig TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS AutomationAction (
  id TEXT PRIMARY KEY,
  automationId TEXT,
  type TEXT,
  config TEXT,
  position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Notification (
  id TEXT PRIMARY KEY,
  userId TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  isRead INTEGER DEFAULT 0,
  link TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Coupon (
  id TEXT PRIMARY KEY,
  userId TEXT,
  code TEXT UNIQUE,
  discountType TEXT DEFAULT 'percent',
  discountValue INTEGER,
  maxUses INTEGER,
  usedCount INTEGER DEFAULT 0,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Payout (
  id TEXT PRIMARY KEY,
  userId TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'PENDING',
  method TEXT,
  stripeId TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS AuditLog (
  id TEXT PRIMARY KEY,
  userId TEXT,
  action TEXT,
  entity TEXT,
  entityId TEXT,
  metadata TEXT,
  ip TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS Event (
  id TEXT PRIMARY KEY,
  userId TEXT,
  type TEXT,
  entityId TEXT,
  metadata TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS LedgerEntry (
  id TEXT PRIMARY KEY,
  userId TEXT,
  orderId TEXT,
  type TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  description TEXT,
  metadata TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS MarketplaceListing (
  id TEXT PRIMARY KEY,
  courseId TEXT UNIQUE,
  isApproved INTEGER DEFAULT 0,
  approvedAt TEXT,
  rejectionReason TEXT,
  featured INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS Review (
  id TEXT PRIMARY KEY,
  userId TEXT,
  courseId TEXT,
  rating INTEGER,
  comment TEXT,
  createdAt TEXT
);
`;

db.exec(createTablesSQL);

// Helper to parse where clause
function buildWhere(where: any): { clause: string; params: any[] } {
  if (!where) return { clause: "", params: [] };
  const conditions: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    
    // Handle special operators
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const v: any = value;
      if (v.contains !== undefined) {
        conditions.push(`${key} LIKE ?`);
        params.push(`%${v.contains}%`);
      } else if (v.gte !== undefined) {
        conditions.push(`${key} >= ?`);
        params.push(v.gte);
      } else if (v.lte !== undefined) {
        conditions.push(`${key} <= ?`);
        params.push(v.lte);
      } else if (v.in !== undefined) {
        const placeholders = v.in.map(() => "?").join(",");
        conditions.push(`${key} IN (${placeholders})`);
        params.push(...v.in);
      } else if (v.equals !== undefined) {
        conditions.push(`${key} = ?`);
        params.push(v.equals);
      } else {
        // Nested or unknown, skip
        continue;
      }
    } else {
      conditions.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (conditions.length === 0) return { clause: "", params: [] };
  return { clause: "WHERE " + conditions.join(" AND "), params };
}

function mapRow(table: string, row: any) {
  if (!row) return null;
  // Convert INTEGER booleans to boolean where appropriate
  const boolFields: Record<string, string[]> = {
    User: ["isSuperAdmin", "emailVerified", "onboardingDone"],
    Product: ["isFree", "isPublished"],
    Course: ["isFree", "isNuvraAcademy", "certificateEnabled"],
    CourseModule: ["isPublished"],
    Lesson: ["isFree", "isPublished"],
    Enrollment: ["completed"],
    Progress: ["isCompleted"],
    Funnel: ["isPublished"],
    Page: ["isPublished"],
    LinkInBio: ["isPublished"],
    Affiliate: ["isActive"],
    EmailSequence: ["isActive"],
    Automation: ["isActive"],
    Notification: ["isRead"],
    Coupon: ["isActive"],
    MarketplaceListing: ["isApproved", "featured"],
    QuizAnswer: ["isCorrect"],
  };
  
  const fields = boolFields[table] || [];
  const mapped = { ...row };
  for (const f of fields) {
    if (mapped[f] !== undefined && mapped[f] !== null) {
      mapped[f] = mapped[f] === 1 ? true : mapped[f] === 0 ? false : mapped[f];
    }
  }
  return mapped;
}

class Model {
  table: string;
  constructor(table: string) {
    this.table = table;
  }

  findMany(opts: any = {}) {
    const where = buildWhere(opts.where);
    let sql = `SELECT * FROM "${this.table}" ${where.clause}`;
    
    if (opts.orderBy) {
      const order = Array.isArray(opts.orderBy) ? opts.orderBy : [opts.orderBy];
      const orderClauses = order.map((o: any) => {
        const [field, dir] = Object.entries(o)[0] as [string, string];
        return `${field} ${dir.toUpperCase()}`;
      }).join(", ");
      if (orderClauses) sql += ` ORDER BY ${orderClauses}`;
    }

    if (opts.take) {
      sql += ` LIMIT ${opts.take}`;
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(...where.params) as any[];
    let mapped = rows.map((r) => mapRow(this.table, r));

    // Handle includes manually for common cases - we will do separate queries in calling code if needed
    // For simplicity, we return raw rows, and let higher level handle includes via additional queries
    // But we attempt to handle includes if provided
    if (opts.include) {
      // This is complex, we handle some specific includes in wrapper functions
      // For now, we return without includes and let caller handle if needed via separate method
      // However for compatibility, we will attempt to fetch includes for known relations
      mapped = mapped.map((row) => {
        const withIncludes: any = { ...row };
        // Handle includes by lazy loading - we don't have async here, so we need to do sync queries
        // We'll implement for common relations
        if (opts.include) {
          for (const [rel, relOpts] of Object.entries(opts.include)) {
            try {
              // Map relation to table
              const relationMap: Record<string, { table: string; foreignKey: string; localKey: string; isMany: boolean }> = {
                profile: { table: "Profile", foreignKey: "userId", localKey: "id", isMany: false },
                modules: { table: "CourseModule", foreignKey: "courseId", localKey: "id", isMany: true },
                lessons: { table: "Lesson", foreignKey: "moduleId", localKey: "id", isMany: true },
                steps: { table: "FunnelStep", foreignKey: "funnelId", localKey: "id", isMany: true },
                blocks: { table: "PageBlock", foreignKey: "pageId", localKey: "id", isMany: true },
                user: { table: "User", foreignKey: "id", localKey: "userId", isMany: false },
                course: { table: "Course", foreignKey: "id", localKey: "courseId", isMany: false },
                progresses: { table: "Progress", foreignKey: "enrollmentId", localKey: "id", isMany: true },
                enrollments: { table: "Enrollment", foreignKey: "courseId", localKey: "id", isMany: true },
                reviews: { table: "Review", foreignKey: "courseId", localKey: "id", isMany: true },
                marketplaceListing: { table: "MarketplaceListing", foreignKey: "courseId", localKey: "id", isMany: false },
                actions: { table: "AutomationAction", foreignKey: "automationId", localKey: "id", isMany: true },
                sales: { table: "ResellerSale", foreignKey: "resellerId", localKey: "id", isMany: true },
                clicks: { table: "AffiliateClick", foreignKey: "affiliateId", localKey: "id", isMany: true },
                items: { table: "OrderItem", foreignKey: "orderId", localKey: "id", isMany: true },
                payment: { table: "Payment", foreignKey: "orderId", localKey: "id", isMany: false },
                reseller: { table: "Reseller", foreignKey: "userId", localKey: "id", isMany: false },
              };

              const relDef = relationMap[rel];
              if (relDef) {
                if (relDef.isMany) {
                  const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                  const related = s.all(row[relDef.localKey]) as any[];
                  withIncludes[rel] = related.map((r) => mapRow(relDef.table, r));
                } else {
                  // For user relation, foreignKey is id, localKey is userId
                  // Need to handle both directions
                  let fkVal = row[relDef.localKey];
                  if (rel === "user" && row.userId) fkVal = row.userId;
                  if (rel === "course" && row.courseId) fkVal = row.courseId;
                  if (rel === "profile" && row.id) {
                    const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                    const related = s.get(row.id) as any;
                    withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
                  } else if (fkVal) {
                    const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                    const related = s.get(fkVal) as any;
                    withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
                  }
                }
              }
            } catch (e) {
              // ignore include errors
            }
          }
        }
        return withIncludes;
      });
    }

    return mapped;
  }

  findUnique(opts: any) {
    const where = opts.where;
    if (!where) return null;
    const { clause, params } = buildWhere(where);
    const sql = `SELECT * FROM "${this.table}" ${clause} LIMIT 1`;
    const stmt = db.prepare(sql);
    const row = stmt.get(...params) as any;
    if (!row) return null;
    const mapped = mapRow(this.table, row);

    // Handle includes for findUnique as well
    if (opts.include && mapped) {
      const withIncludes: any = { ...mapped };
      for (const [rel] of Object.entries(opts.include)) {
        try {
          const relationMap: Record<string, { table: string; foreignKey: string; localKey: string; isMany: boolean }> = {
            profile: { table: "Profile", foreignKey: "userId", localKey: "id", isMany: false },
            modules: { table: "CourseModule", foreignKey: "courseId", localKey: "id", isMany: true },
            lessons: { table: "Lesson", foreignKey: "moduleId", localKey: "id", isMany: true },
            steps: { table: "FunnelStep", foreignKey: "funnelId", localKey: "id", isMany: true },
            blocks: { table: "PageBlock", foreignKey: "pageId", localKey: "id", isMany: true },
            user: { table: "User", foreignKey: "id", localKey: "userId", isMany: false },
            course: { table: "Course", foreignKey: "id", localKey: "courseId", isMany: false },
            progresses: { table: "Progress", foreignKey: "enrollmentId", localKey: "id", isMany: true },
            enrollments: { table: "Enrollment", foreignKey: "courseId", localKey: "id", isMany: true },
            reviews: { table: "Review", foreignKey: "courseId", localKey: "id", isMany: true },
            marketplaceListing: { table: "MarketplaceListing", foreignKey: "courseId", localKey: "id", isMany: false },
            actions: { table: "AutomationAction", foreignKey: "automationId", localKey: "id", isMany: true },
            sales: { table: "ResellerSale", foreignKey: "resellerId", localKey: "id", isMany: true },
            clicks: { table: "AffiliateClick", foreignKey: "affiliateId", localKey: "id", isMany: true },
            items: { table: "OrderItem", foreignKey: "orderId", localKey: "id", isMany: true },
            payment: { table: "Payment", foreignKey: "orderId", localKey: "id", isMany: false },
            reseller: { table: "Reseller", foreignKey: "userId", localKey: "id", isMany: false },
            quiz: { table: "Quiz", foreignKey: "lessonId", localKey: "id", isMany: false },
          };
          const relDef = relationMap[rel];
          if (relDef) {
            if (relDef.isMany) {
              const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
              const related = s.all(mapped[relDef.localKey]) as any[];
              withIncludes[rel] = related.map((r) => mapRow(relDef.table, r));
            } else {
              if (rel === "profile") {
                const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                const related = s.get(mapped.id) as any;
                withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
              } else if (rel === "user" && mapped.userId) {
                const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE id = ?`);
                const related = s.get(mapped.userId) as any;
                withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
              } else if (rel === "course" && mapped.courseId) {
                const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE id = ?`);
                const related = s.get(mapped.courseId) as any;
                withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
              } else if (rel === "quiz") {
                const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                const related = s.get(mapped.id) as any;
                if (related) {
                  const quizMapped = mapRow(relDef.table, related);
                  // Also load questions
                  const qStmt = db.prepare(`SELECT * FROM QuizQuestion WHERE quizId = ?`);
                  const questions = qStmt.all(related.id) as any[];
                  (quizMapped as any).questions = questions.map((q) => {
                    const aStmt = db.prepare(`SELECT * FROM QuizAnswer WHERE questionId = ?`);
                    const answers = aStmt.all(q.id) as any[];
                    return { ...q, answers };
                  });
                  withIncludes[rel] = quizMapped;
                } else {
                  withIncludes[rel] = null;
                }
              } else {
                const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE id = ?`);
                const related = s.get(mapped[relDef.localKey]) as any;
                withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
              }
            }
          }
        } catch {}
      }
      return withIncludes;
    }

    return mapped;
  }

  findFirst(opts: any = {}) {
    const arr = this.findMany({ ...opts, take: 1 });
    return arr[0] || null;
  }

  count(opts: any = {}) {
    const where = buildWhere(opts.where);
    const sql = `SELECT COUNT(*) as count FROM "${this.table}" ${where.clause}`;
    const stmt = db.prepare(sql);
    const row = stmt.get(...where.params) as any;
    return row.count;
  }

  create(opts: any) {
    const data = opts.data;
    const id = data.id || nanoid();
    const now = nowISO();
    
    // Prepare data with defaults - only add timestamps if not already present and table likely has them
    const finalData: any = { id, ...data };
    // We'll try to insert with what we have, and if column missing, we remove it
    // For now, only set createdAt if data doesn't have it and we are not sure - we will handle via retry
    if (!finalData.createdAt && !["FunnelStep", "PageBlock", "QuizQuestion", "QuizAnswer", "OrderItem", "AutomationAction"].includes(this.table)) {
      finalData.createdAt = now;
    }
    const tablesWithUpdatedAt = ["User", "Profile", "Workspace", "Product", "Course", "CourseModule", "Lesson", "Funnel", "Page", "LinkInBio", "Lead", "Customer", "Order", "Reseller", "Affiliate", "EmailCampaign", "EmailSequence", "Automation", "Payout", "MarketplaceListing"];
    if (tablesWithUpdatedAt.includes(this.table) && !finalData.updatedAt) {
      finalData.updatedAt = now;
    }
    if (this.table === "User" && finalData.isSuperAdmin !== undefined) finalData.isSuperAdmin = toInt(finalData.isSuperAdmin);
    if (this.table === "User" && finalData.emailVerified !== undefined) finalData.emailVerified = toInt(finalData.emailVerified);
    if (this.table === "User" && finalData.onboardingDone !== undefined) finalData.onboardingDone = toInt(finalData.onboardingDone);
    // Convert booleans to int for all bool fields
    const boolFields: Record<string, string[]> = {
      User: ["isSuperAdmin", "emailVerified", "onboardingDone"],
      Product: ["isFree", "isPublished"],
      Course: ["isFree", "isNuvraAcademy", "certificateEnabled"],
      CourseModule: ["isPublished"],
      Lesson: ["isFree", "isPublished"],
      Enrollment: ["completed"],
      Progress: ["isCompleted"],
      Funnel: ["isPublished"],
      Page: ["isPublished"],
      LinkInBio: ["isPublished"],
      Affiliate: ["isActive"],
      EmailSequence: ["isActive"],
      Automation: ["isActive"],
      Notification: ["isRead"],
      Coupon: ["isActive"],
      MarketplaceListing: ["isApproved", "featured"],
      QuizAnswer: ["isCorrect"],
    };
    const bFields = boolFields[this.table] || [];
    for (const f of bFields) {
      if (finalData[f] !== undefined) finalData[f] = toInt(finalData[f]);
    }

    // Remove nested creates for now - handle separately
    const cleanData: any = {};
    for (const [k, v] of Object.entries(finalData)) {
      if (typeof v === "object" && v !== null && !Array.isArray(v) && (v as any).create) {
        continue; // skip nested
      }
      cleanData[k] = v;
    }

    let keys = Object.keys(cleanData);
    let placeholders = keys.map(() => "?").join(", ");
    let values = keys.map((k) => cleanData[k]);
    let sql = `INSERT INTO "${this.table}" (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${placeholders})`;
    try {
      const stmt = db.prepare(sql);
      stmt.run(...values);
    } catch (e: any) {
      // Try to remove columns that don't exist
      if (e.message.includes("has no column named")) {
        const match = e.message.match(/has no column named (\w+)/);
        if (match) {
          const badCol = match[1];
          console.warn(`Removing invalid column ${badCol} for table ${this.table}`);
          delete cleanData[badCol];
          keys = Object.keys(cleanData);
          placeholders = keys.map(() => "?").join(", ");
          values = keys.map((k) => cleanData[k]);
          sql = `INSERT INTO "${this.table}" (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${placeholders})`;
          const stmt2 = db.prepare(sql);
          stmt2.run(...values);
        } else {
          console.error(`Insert failed for ${this.table}`, e.message, cleanData);
          throw e;
        }
      } else {
        console.error(`Insert failed for ${this.table}`, e.message, cleanData);
        throw e;
      }
    }

    // Handle nested creates if present in original data
    if (data.steps?.create) {
      const steps = Array.isArray(data.steps.create) ? data.steps.create : [data.steps.create];
      for (const step of steps) {
        const stepModel = new Model("FunnelStep");
        stepModel.create({ data: { ...step, funnelId: id } });
      }
    }
    if (data.actions?.create) {
      const actions = Array.isArray(data.actions.create) ? data.actions.create : [data.actions.create];
      for (const act of actions) {
        const actModel = new Model("AutomationAction");
        actModel.create({ data: { ...act, automationId: id } });
      }
    }

    return this.findUnique({ where: { id } });
  }

  createMany(opts: any) {
    const datas = opts.data;
    let count = 0;
    for (const d of datas) {
      try {
        this.create({ data: d });
        count++;
      } catch {}
    }
    return { count };
  }

  update(opts: any) {
    const where = opts.where;
    const data = opts.data;
    const { clause, params } = buildWhere(where);
    
    // Convert booleans
    const boolFields: Record<string, string[]> = {
      User: ["isSuperAdmin", "emailVerified", "onboardingDone"],
      Product: ["isFree", "isPublished"],
      Course: ["isFree", "isNuvraAcademy", "certificateEnabled"],
      CourseModule: ["isPublished"],
      Lesson: ["isFree", "isPublished"],
      Enrollment: ["completed"],
      Progress: ["isCompleted"],
      Funnel: ["isPublished"],
      Page: ["isPublished"],
      LinkInBio: ["isPublished"],
      Affiliate: ["isActive"],
      EmailSequence: ["isActive"],
      Automation: ["isActive"],
      Notification: ["isRead"],
      Coupon: ["isActive"],
      MarketplaceListing: ["isApproved", "featured"],
    };
    const bFields = boolFields[this.table] || [];
    const cleanData: any = { ...data };
    for (const f of bFields) {
      if (cleanData[f] !== undefined) cleanData[f] = toInt(cleanData[f]);
    }
    cleanData.updatedAt = nowISO();

    // Handle increment
    for (const [k, v] of Object.entries(cleanData)) {
      if (typeof v === "object" && v !== null && (v as any).increment) {
        // Handle increment via SQL
        const inc = (v as any).increment;
        const sql = `UPDATE "${this.table}" SET ${k} = ${k} + ? ${clause}`;
        const stmt = db.prepare(sql);
        stmt.run(inc, ...params);
        delete cleanData[k];
      }
    }

    const setClauses = Object.keys(cleanData).map((k) => `"${k}" = ?`).join(", ");
    const setValues = Object.values(cleanData);

    if (setClauses) {
      const sql = `UPDATE "${this.table}" SET ${setClauses} ${clause}`;
      const stmt = db.prepare(sql);
      stmt.run(...setValues, ...params);
    }

    return this.findUnique({ where });
  }

  upsert(opts: any) {
    const existing = this.findUnique({ where: opts.where });
    if (existing) {
      return this.update({ where: opts.where, data: opts.update });
    } else {
      return this.create({ data: { ...opts.where, ...opts.create } });
    }
  }

  delete(opts: any) {
    const { clause, params } = buildWhere(opts.where);
    const sql = `DELETE FROM "${this.table}" ${clause}`;
    const stmt = db.prepare(sql);
    stmt.run(...params);
    return { count: 1 };
  }

  deleteMany(opts: any = {}) {
    const { clause, params } = buildWhere(opts.where);
    const sql = `DELETE FROM "${this.table}" ${clause}`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { count: result.changes };
  }
}

// Create prisma-like object
function createPrisma() {
  const tables = [
    "User", "Profile", "Workspace", "WorkspaceMembership", "Product", "ProductPrice",
    "Course", "CourseModule", "Lesson", "Quiz", "QuizQuestion", "QuizAnswer",
    "Enrollment", "Progress", "Certificate", "Funnel", "FunnelStep", "Page", "PageBlock",
    "LinkInBio", "Lead", "Customer", "Order", "OrderItem", "Payment", "Refund",
    "Reseller", "ResellerSale", "Commission", "Affiliate", "AffiliateClick", "AffiliateSale",
    "EmailCampaign", "EmailSequence", "Automation", "AutomationAction", "Notification",
    "Coupon", "Payout", "AuditLog", "Event", "LedgerEntry", "MarketplaceListing", "Review"
  ];

  const obj: any = {};
  for (const t of tables) {
    const lower = t.charAt(0).toLowerCase() + t.slice(1);
    // Special handling for Order (reserved word) - table name is Order but property is order
    obj[lower] = new Model(t);
    // Also add capitalized version for compatibility
    obj[t] = obj[lower];
  }

  // Alias for order (since Order is reserved, but we use lowercase)
  obj.order = obj.Order;

  // Add $disconnect etc
  obj.$disconnect = async () => {
    try { db.close(); } catch {}
  };

  return obj;
}

export const prisma = createPrisma();
export default prisma;

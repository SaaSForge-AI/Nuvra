// Nuvra DB Layer - Supports both SQLite (dev) and PostgreSQL (prod/Vercel)
// - If DATABASE_URL starts with postgres, uses PrismaClient (requires `prisma generate`)
// - If DATABASE_URL starts with file: or is unset, uses custom SQLite via node:sqlite (Node 22+)

let prismaInstance: any = null;
let isUsingPrisma = false;

function isPostgresUrl(url: string | undefined) {
  if (!url) return false;
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

if (isPostgresUrl(dbUrl)) {
  // Production / Vercel path - use Prisma
  try {
    // Dynamically require to avoid issues when not generated
    const { PrismaClient } = require("@prisma/client");
    // Check if client is properly generated (has models)
    // The stub client from failed generate will have no real models, but we try anyway
    const globalForPrisma = global as unknown as { prisma: any };
    prismaInstance = globalForPrisma.prisma || new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
    isUsingPrisma = true;
    console.log("[DB] Using Prisma with PostgreSQL - Vercel ready");
  } catch (e) {
    console.error("[DB] DATABASE_URL is PostgreSQL but PrismaClient failed to initialize.");
    console.error("[DB] On Vercel, ensure `prisma generate` ran in postinstall. On local, check network to binaries.prisma.sh");
    console.error("[DB] Error:", e);
    // In production (Vercel), we should NOT fallback to SQLite - throw
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      throw new Error("PrismaClient not initialized but DATABASE_URL is PostgreSQL. Run `prisma generate` and ensure DATABASE_URL is set. On Vercel, this should happen in postinstall.");
    }
    console.warn("[DB] Falling back to SQLite for local dev");
    // Fall through to SQLite for local dev
  }
}

if (!prismaInstance) {
  // If we are on Vercel and no postgres URL, we must fail clearly - Vercel FS is read-only
  if (process.env.VERCEL && !isPostgresUrl(dbUrl)) {
    console.error("[DB] VERCEL detected but DATABASE_URL is not postgres. Set DATABASE_URL to a Postgres URL (Neon/Supabase) in Vercel env vars.");
    // Create a mock that throws helpful JSON errors instead of crashing with HTML
    const errorMock = new Proxy({}, {
      get(_target, prop) {
        if (prop === "$disconnect") return async () => {};
        return () => {
          throw new Error("DATABASE_URL manquant sur Vercel. Va dans Vercel > Settings > Environment Variables > ajoute DATABASE_URL (postgres://...) puis Redeploy. Sans ça, l'API renvoie du HTML et tu vois <!DOCTYPE> error.");
        };
      }
    });
    // Create full mock with all tables
    const tables = ["User","Profile","Workspace","WorkspaceMembership","Product","ProductPrice","Course","CourseModule","Lesson","Quiz","QuizQuestion","QuizAnswer","Enrollment","Progress","Certificate","Funnel","FunnelStep","Page","PageBlock","LinkInBio","Lead","Customer","Order","OrderItem","Payment","Refund","Reseller","ResellerSale","Commission","Affiliate","AffiliateClick","AffiliateSale","EmailCampaign","EmailSequence","Automation","AutomationAction","Notification","Coupon","Payout","AuditLog","Event","LedgerEntry","MarketplaceListing","Review"];
    const mockObj: any = { $disconnect: async () => {} };
    for (const t of tables) {
      const lower = t.charAt(0).toLowerCase() + t.slice(1);
      mockObj[lower] = errorMock;
      mockObj[t] = errorMock;
    }
    mockObj.order = errorMock;
    prismaInstance = mockObj;
  } else {
  // SQLite fallback for dev
  console.log("[DB] Using custom SQLite layer (node:sqlite) - dev mode");
  
  // Lazy load node:sqlite only when needed
  let DatabaseSync: any;
  try {
    // @ts-ignore - node:sqlite is experimental
    const sqlite = require("node:sqlite");
    DatabaseSync = sqlite.DatabaseSync;
  } catch (e) {
    console.error("[DB] node:sqlite not available, requires Node 22+. Trying to use better-sqlite3 fallback or mock");
    // If node:sqlite not available, create a mock that throws helpful error
    throw new Error("SQLite requires Node 22+ with --experimental-vm-modules or use PostgreSQL. Set DATABASE_URL to postgres URL for production.");
  }

  const fs = require("fs");
  const path = require("path");
  const { nanoid } = require("nanoid");

  const dbPath = dbUrl.replace("file:", "") || "./prisma/dev.db";
  const resolvedPath = path.resolve(dbPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new DatabaseSync(resolvedPath);

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

  function buildWhere(where: any): { clause: string; params: any[] } {
    if (!where) return { clause: "", params: [] };
    const conditions: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(where)) {
      if (value === undefined) continue;
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
      if (opts.take) sql += ` LIMIT ${opts.take}`;
      const stmt = db.prepare(sql);
      const rows = stmt.all(...where.params) as any[];
      let mapped = rows.map((r) => mapRow(this.table, r));
      if (opts.include) {
        mapped = mapped.map((row) => {
          const withIncludes: any = { ...row };
          if (opts.include) {
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
                };
                const relDef = relationMap[rel];
                if (relDef) {
                  if (relDef.isMany) {
                    const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                    const related = s.all(row[relDef.localKey]) as any[];
                    withIncludes[rel] = related.map((r) => mapRow(relDef.table, r));
                  } else {
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
              } catch {}
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
                const related = s.all((mapped as any)[relDef.localKey]) as any[];
                withIncludes[rel] = related.map((r) => mapRow(relDef.table, r));
              } else {
                if (rel === "profile") {
                  const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                  const related = s.get((mapped as any).id) as any;
                  withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
                } else if (rel === "user" && (mapped as any).userId) {
                  const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE id = ?`);
                  const related = s.get((mapped as any).userId) as any;
                  withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
                } else if (rel === "course" && (mapped as any).courseId) {
                  const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE id = ?`);
                  const related = s.get((mapped as any).courseId) as any;
                  withIncludes[rel] = related ? mapRow(relDef.table, related) : null;
                } else if (rel === "quiz") {
                  const s = db.prepare(`SELECT * FROM "${relDef.table}" WHERE ${relDef.foreignKey} = ?`);
                  const related = s.get((mapped as any).id) as any;
                  if (related) {
                    const quizMapped = mapRow(relDef.table, related);
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
                  const related = s.get((mapped as any)[relDef.localKey]) as any;
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
      const finalData: any = { id, ...data };
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
      const cleanData: any = {};
      for (const [k, v] of Object.entries(finalData)) {
        if (typeof v === "object" && v !== null && !Array.isArray(v) && (v as any).create) continue;
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
        if (e.message.includes("has no column named")) {
          const match = e.message.match(/has no column named (\w+)/);
          if (match) {
            const badCol = match[1];
            delete cleanData[badCol];
            keys = Object.keys(cleanData);
            placeholders = keys.map(() => "?").join(", ");
            values = keys.map((k) => cleanData[k]);
            sql = `INSERT INTO "${this.table}" (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${placeholders})`;
            const stmt2 = db.prepare(sql);
            stmt2.run(...values);
          } else throw e;
        } else throw e;
      }
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
      if (["User", "Profile", "Workspace", "Product", "Course", "CourseModule", "Lesson", "Funnel", "Page", "LinkInBio", "Lead", "Customer", "Order", "Reseller", "Affiliate", "EmailCampaign", "EmailSequence", "Automation", "Payout", "MarketplaceListing"].includes(this.table)) {
        cleanData.updatedAt = nowISO();
      }
      for (const [k, v] of Object.entries(cleanData)) {
        if (typeof v === "object" && v !== null && (v as any).increment) {
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
        try {
          const sql = `UPDATE "${this.table}" SET ${setClauses} ${clause}`;
          const stmt = db.prepare(sql);
          stmt.run(...setValues, ...params);
        } catch (e: any) {
          if (e.message.includes("has no column named")) {
            const match = e.message.match(/has no column named (\w+)/);
            if (match) {
              delete cleanData[match[1]];
              const setClauses2 = Object.keys(cleanData).map((k) => `"${k}" = ?`).join(", ");
              const setValues2 = Object.values(cleanData);
              if (setClauses2) {
                const sql = `UPDATE "${this.table}" SET ${setClauses2} ${clause}`;
                const stmt = db.prepare(sql);
                stmt.run(...setValues2, ...params);
              }
            }
          } else throw e;
        }
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

  function createPrismaMock() {
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
      obj[lower] = new Model(t);
      obj[t] = obj[lower];
    }
    obj.order = obj.Order;
    obj.$disconnect = async () => {
      try { db.close(); } catch {}
    };
    return obj;
  }

  prismaInstance = createPrismaMock();
  } // end else local sqlite
} // end if !prismaInstance

export const prisma = prismaInstance;
export default prisma;
export const isPrismaPostgres = isUsingPrisma;

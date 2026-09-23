import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const userCount = await prisma.user.count({});
    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      db: process.env.DATABASE_URL?.startsWith("postgres") ? "postgres" : "sqlite",
      users: userCount,
      vercel: !!process.env.VERCEL,
    });
  } catch (e: any) {
    return NextResponse.json({ status: "error", error: e.message }, { status: 500 });
  }
}

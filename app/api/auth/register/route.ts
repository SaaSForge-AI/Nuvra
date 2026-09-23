import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const usernameBase = slugify(`${firstName}${lastName}${Math.floor(Math.random() * 1000)}`);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        username: usernameBase,
        role: "CREATOR",
      },
    });

    await prisma.profile.create({
      data: { userId: user.id },
    });

    const workspaceSlug = slugify(`${firstName}-workspace-${Date.now()}`);
    const workspace = await prisma.workspace.create({
      data: {
        name: `${firstName}'s Workspace`,
        slug: workspaceSlug,
        ownerId: user.id,
      },
    });

    await prisma.workspaceMembership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });

    await prisma.linkInBio.create({
      data: {
        userId: user.id,
        username: usernameBase,
        displayName: `${firstName} ${lastName}`,
        bio: "Creator on Nuvra",
        blocks: JSON.stringify([
          { type: "profile", data: { name: `${firstName} ${lastName}`, bio: "Welcome to my Nuvra page" } },
        ]),
      },
    });

    await prisma.event.create({
      data: {
        type: "user_created",
        userId: user.id,
        metadata: JSON.stringify({ email }),
      },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      username: user.username,
      onboardingDone: user.onboardingDone,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Registration failed" }, { status: 500 });
  }
}

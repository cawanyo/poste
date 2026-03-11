import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { lat, lng, city } = await req.json();
  const userId = (session.user as { id: string }).id;

  const location = await prisma.location.upsert({
    where: { userId },
    update: { lat, lng, city, updatedAt: new Date() },
    create: { userId, lat, lng, city },
  });

  return NextResponse.json(location);
}

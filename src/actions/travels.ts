"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { travelSchema } from "@/lib/validations";

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function createTravel(data: unknown) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return { error: "Non autorisé" };

  const parsed = travelSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const {
    departureCity,
    arrivalCity,
    departureDate,
    departureTime,
    arrivalDate,
    arrivalTime,
    availableKg,
    pricePerKg,
    description,
  } = parsed.data;

  const departureDateTime = new Date(`${departureDate}T${departureTime}`);
  const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);

  const travel = await prisma.travel.create({
    data: {
      userId,
      departureCity,
      arrivalCity,
      departureDate: departureDateTime,
      arrivalDate: arrivalDateTime,
      availableKg,
      remainingKg: availableKg,
      pricePerKg,
      description,
    },
  });

  revalidatePath("/travels");
  return { success: true, id: travel.id };
}



export async function getTravelInfo(travelId: string) {
  return prisma.travel.findUnique({
    where: { id: travelId },
    include: {user: { select: { id: true, name: true, avatar: true } }}
  });
}

async function updateTravel(travelId: string, newTotalKilos: number) {
  // 1. Récupérer le voyage et le total des réservations actuelles
  const travel = await prisma.travel.findUnique({
    where: { id: travelId },
  });

  // 2. Calculer le nombre de kilos déjà réservés
  const reservedKilos = travel? travel.reservations.reduce((sum, res) => sum + res.kg, 0) : 0;

  // 3. Appliquer votre contrainte
  if (newTotalKilos < reservedKilos) {
    throw new Error(`Impossible de réduire à ${newTotalKilos}kg. Vous avez déjà ${reservedKilos}kg de réservés.`);
  }

  // 4. Mettre à jour si la condition est respectée
  return await prisma.travel.update({
    where: { id: travelId },
    data: { availableKg: newTotalKilos }
  });
}

export async function getTravels(params?: {
  departureCity?: string;
  arrivalCity?: string;
  date?: string;
}) {
  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (params?.departureCity) {
    where.departureCity = { contains: params.departureCity };
  }
  if (params?.arrivalCity) {
    where.arrivalCity = { contains: params.arrivalCity };
  }
  if (params?.date) {
    const start = new Date(params.date);
    const end = new Date(params.date);
    end.setDate(end.getDate() + 1);
    where.departureDate = { gte: start, lt: end };
  }

  return prisma.travel.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { reservations: true } },
    },
    orderBy: { departureDate: "asc" },
  });
}

export async function getTravel(id: string) {
  return prisma.travel.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true, phone: true } },
      reservations: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function getUserTravels() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return [];

  return prisma.travel.findMany({
    where: { userId },
    include: {
      _count: { select: { reservations: true } },
      reservations: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTravelStatus(travelId: string, status: string) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return { error: "Non autorisé" };

  const travel = await prisma.travel.findUnique({ where: { id: travelId } });
  if (travel?.userId !== userId) return { error: "Non autorisé" };

  await prisma.travel.update({ where: { id: travelId }, data: { status } });
  revalidatePath("/dashboard");
  return { success: true };
}

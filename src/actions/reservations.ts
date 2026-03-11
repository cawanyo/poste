"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { reservationSchema, paymentSchema } from "@/lib/validations";
import { generateCode } from "@/lib/utils";

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function createReservation(travelId: string, data: unknown) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return { error: "Non autorisé" };

  const parsed = reservationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { kg, notes } = parsed.data;

  const travel = await prisma.travel.findUnique({ where: { id: travelId } });
  if (!travel) return { error: "Voyage introuvable" };
  if (travel.userId === userId) return { error: "Vous ne pouvez pas réserver votre propre voyage" };
  if (travel.remainingKg < kg) return { error: `Seulement ${travel.remainingKg} kg disponibles` };

  const totalPrice = kg * travel.pricePerKg;
  const code = generateCode();

  const reservation = await prisma.reservation.create({
    data: {
      userId,
      travelId,
      kg,
      totalPrice,
      code,
      notes,
    },
  });

  revalidatePath(`/travels/${travelId}`);
  return { success: true, id: reservation.id, code };
}

export async function processPayment(data: unknown) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return { error: "Non autorisé" };

  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { reservationId } = parsed.data;

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { travel: true },
  });

  if (!reservation) return { error: "Réservation introuvable" };
  if (reservation.userId !== userId) return { error: "Non autorisé" };

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        reservationId,
        amount: reservation.totalPrice,
        status: "COMPLETED",
        transactionId: `TXN-${Date.now()}`,
      },
    }),
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "PAID" },
    }),
    prisma.travel.update({
      where: { id: reservation.travelId },
      data: { remainingKg: { decrement: reservation.kg } },
    }),
  ]);

  revalidatePath("/reservations");
  return { success: true };
}

export async function getUserReservations() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return [];

  return prisma.reservation.findMany({
    where: { userId },
    include: {
      travel: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReservation(id: string) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return null;

  return prisma.reservation.findFirst({
    where: {
      id,
      OR: [{ userId }, { travel: { userId } }],
    },
    include: {
      user: { select: { id: true, name: true, avatar: true, phone: true } },
      travel: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, phone: true, location: true },
            // include: { location: true },
          },
        },
      },
      payment: true,
    },
  });
}

export async function validateDelivery(code: string) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return { error: "Non autorisé" };

  const reservation = await prisma.reservation.findFirst({
    where: { code, travel: { userId } },
    include: { travel: true },
  });

  if (!reservation) return { error: "Code invalide" };
  if (reservation.status === "VALIDATED") return { error: "Déjà validé" };

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "VALIDATED" },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateReservationStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return { error: "Non autorisé" };

  const reservation = await prisma.reservation.findFirst({
    where: { id, travel: { userId } },
  });

  if (!reservation) return { error: "Non autorisé" };

  await prisma.reservation.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard");
  return { success: true };
}

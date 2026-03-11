"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function sendMessage(data: unknown) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return { error: "Non autorisé" };

  const parsed = messageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { content, receiverId, travelId } = parsed.data;

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      travelId,
      content,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  revalidatePath("/messages");
  return { success: true, message };
}

export async function getConversation(otherUserId: string, travelId?: string) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return [];

  return prisma.message.findMany({
    where: {
      travelId: travelId ?? undefined,
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}



export async function getConversations() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return [];

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      travel: { select: { id: true, departureCity: true, arrivalCity: true } },
    },
    orderBy: { createdAt: "desc" },
    distinct: ["senderId", "receiverId"],
  });

  return messages;
}

export async function markMessagesRead(senderId: string) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) return;

  await prisma.message.updateMany({
    where: { senderId, receiverId: userId, read: false },
    data: { read: true },
  });
}

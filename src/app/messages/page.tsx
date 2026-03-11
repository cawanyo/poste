import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getConversations } from "@/actions/messages";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Plane, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import ChatWidget from "@/components/ChatPage";
import ConversationList from "./ConversationList";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  const currentUserId = (session.user as { id: string }).id;

  const conversations = await getConversations();

  const uniqueConvos = Array.from(
    new Map(
      conversations.map((m) => {
        const otherId = m.senderId === currentUserId ? m.receiverId : m.senderId;
        return [otherId, m];
      })
    ).values()
  );

  return (
    <ConversationList conversations={uniqueConvos} currentUserId={currentUserId} />
  );
}

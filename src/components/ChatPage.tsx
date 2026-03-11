"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema, type MessageInput } from "@/lib/validations";
import { sendMessage, getConversation } from "@/actions/messages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, X } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface ChatWidgetProps {
  currentUserId: string;
  otherUser: { id: string; name: string };
  travelId?: string;
  opened?: boolean;
}

export type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date | string;
  sender: { id: string; name: string; avatar?: string | null };
};

export default function ChatWidget({ currentUserId, otherUser, travelId, opened }: ChatWidgetProps) {
  const [open, setOpen] = useState(opened ?? false);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      receiverId: otherUser.id,
      travelId: travelId,
    },
  });

  useEffect(() => {
    if (open) {
      getConversation(otherUser.id, travelId).then(setMessages);
    }
  }, [open, otherUser.id, travelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const es = new EventSource("/api/sse");
    es.addEventListener("message", (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.senderId === otherUser.id) {
          setMessages((prev) => [...prev, msg]);
        }
      } catch {}
    });
    return () => es.close();
  }, [open, otherUser.id]);

  async function onSubmit(data: Omit<MessageInput, "receiverId" | "travelId"> & { receiverId: string; travelId?: string }) {
    const res = await sendMessage({ ...data, receiverId: otherUser.id, travelId });
    if (res.success && res.message) {
      setMessages((prev) => [...prev, res.message as Message]);
      reset({ receiverId: otherUser.id, travelId });
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 rounded-2xl border border-white/10 bg-gray-900 shadow-2xl flex flex-col overflow-hidden" style={{ height: 420 }}>
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-indigo-600/20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs text-white font-medium">
                {otherUser.name[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white">{otherUser.name}</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-sm text-gray-500 mt-8">
                Démarrez la conversation
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    msg.senderId === currentUserId
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-white/10 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-60 mt-0.5 text-right">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-2 p-3 border-t border-white/10"
          >
            <Input
              {...register("content")}
              placeholder="Votre message..."
              className="flex-1 h-9 text-xs"
            />
            <Button type="submit" size="icon" disabled={isSubmitting} className="h-9 w-9 shrink-0">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}
    </div>
  );
}

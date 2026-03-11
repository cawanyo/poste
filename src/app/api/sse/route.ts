import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as { id: string }).id : null;

  const stream = new ReadableStream({
    start(controller) {
      if (userId) clients.set(userId, controller);
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("data: connected\n\n"));

      req.signal.addEventListener("abort", () => {
        if (userId) clients.delete(userId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function sendEvent(userId: string, event: string, data: unknown) {
  const controller = clients.get(userId);
  if (controller) {
    try {
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    } catch {}
  }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationModal from "@/components/ReservationModal";
import ChatWidget from "@/components/ChatWidget";
import { Package, MessageCircle, LogIn } from "lucide-react";
import Link from "next/link";

interface TravelDetailClientProps {
  travel: {
    id: string;
    remainingKg: number;
    pricePerKg: number;
    departureCity: string;
    arrivalCity: string;
    status: string;
    userId: string;
    user: { id: string; name: string };
  };
  currentUserId?: string;
  isOwner: boolean;
}

export default function TravelDetailClient({
  travel,
  currentUserId,
  isOwner,
}: TravelDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!currentUserId) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-500 text-center">
          Connectez-vous pour réserver ou contacter le voyageur
        </p>
        <Link href="/auth/login">
          <Button className="w-full gap-2">
            <LogIn className="h-4 w-4" />
            Se connecter
          </Button>
        </Link>
      </div>
    );
  }

  if (isOwner) {
    return (
      <p className="text-sm text-gray-500 text-center">
        C&apos;est votre voyage
      </p>
    );
  }

  if (travel.status !== "ACTIVE" || travel.remainingKg <= 0) {
    return (
      <p className="text-sm text-red-400 text-center">
        Ce voyage n&apos;accepte plus de réservations
      </p>
    );
  }

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        className="w-full gap-2 mb-3"
      >
        <Package className="h-4 w-4" />
        Réserver des kilos
      </Button>

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        travel={travel}
      />

      <ChatWidget
        currentUserId={currentUserId}
        otherUser={travel.user}
        travelId={travel.id}
      />
    </>
  );
}

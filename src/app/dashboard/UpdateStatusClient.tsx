"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateTravelStatus } from "@/actions/travels";
import { updateReservationStatus } from "@/actions/reservations";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

interface UpdateStatusClientProps {
  travelId: string;
  currentStatus: string;
}

const TRAVEL_STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
];

export default function UpdateStatusClient({ travelId, currentStatus }: UpdateStatusClientProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleChange(status: string) {
    setLoading(true);
    setOpen(false);
    const res = await updateTravelStatus(travelId, status);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success("Statut mis à jour");
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="gap-1"
      >
        Statut <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-white/10 bg-gray-900 shadow-2xl z-20">
          {TRAVEL_STATUSES.filter((s) => s.value !== currentStatus).map((s) => (
            <button
              key={s.value}
              onClick={() => handleChange(s.value)}
              className="flex w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 first:rounded-t-xl last:rounded-b-xl transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

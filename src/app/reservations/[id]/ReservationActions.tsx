"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface ReservationActionsProps {
  reservation: {
    id: string;
    status: string;
    travel: {
      user: { id: string; name: string };
    };
  };
}

export default function ReservationActions({ reservation }: ReservationActionsProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; city?: string } | null>(null);

  useEffect(() => {
    if (!["IN_TRANSIT", "DELIVERED"].includes(reservation.status)) return;

    const es = new EventSource("/api/sse");
    es.addEventListener("location", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.userId === reservation.travel.user.id) {
          setLocation(data);
        }
      } catch {}
    });
    return () => es.close();
  }, [reservation.status, reservation.travel.user.id]);

  if (!location && !["IN_TRANSIT", "DELIVERED"].includes(reservation.status)) return null;

  return location ? (
    <Card className="mb-6">
      <CardContent className="p-5">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-violet-400 animate-pulse" />
          Position en temps réel
        </h3>
        <MapView
          lat={location.lat}
          lng={location.lng}
          city={location.city}
          userName={reservation.travel.user.name}
        />
      </CardContent>
    </Card>
  ) : null;
}

"use client";

import { useEffect, useRef } from "react";
import { Navigation } from "lucide-react";

export default function LocationTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function updateLocation() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          await fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });
        } catch {}
      });
    }

    updateLocation();
    intervalRef.current = setInterval(updateLocation, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
      <Navigation className="h-3 w-3 animate-pulse" />
      Position partagée
    </div>
  );
}

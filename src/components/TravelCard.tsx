import Link from "next/link";
import { Plane, MapPin, Calendar, Weight, Euro, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatPrice, TRAVEL_STATUS } from "@/lib/utils";

interface TravelCardProps {
  travel: {
    id: string;
    departureCity: string;
    arrivalCity: string;
    departureDate: Date | string;
    arrivalDate: Date | string;
    availableKg: number;
    remainingKg: number;
    pricePerKg: number;
    status: string;
    description?: string | null;
    user: { id: string; name: string; avatar?: string | null };
    _count?: { reservations: number };
  };
}

export default function TravelCard({ travel }: TravelCardProps) {
  const statusInfo = TRAVEL_STATUS[travel.status] ?? TRAVEL_STATUS.ACTIVE;
  const occupancyPct = Math.round(((travel.availableKg - travel.remainingKg) / travel.availableKg) * 100);

  return (
    <Link href={`/travels/${travel.id}`}>
      <Card className="hover:border-violet-500/30 hover:shadow-violet-500/10 transition-all duration-300 group cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              {travel._count?.reservations ?? 0} réservation(s)
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-white">{travel.departureCity}</p>
              <p className="text-xs text-gray-500">{formatTime(travel.departureDate)}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 w-full">
                <div className="h-px flex-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
                <Plane className="h-4 w-4 text-violet-400 rotate-0" />
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-600 to-violet-600" />
              </div>
            </div>
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-white">{travel.arrivalCity}</p>
              <p className="text-xs text-gray-500">{formatTime(travel.arrivalDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4 text-violet-400 flex-shrink-0" />
              <span>{formatDate(travel.departureDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Weight className="h-4 w-4 text-indigo-400 flex-shrink-0" />
              <span>{travel.remainingKg} kg dispo.</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Capacité utilisée</span>
              <span>{occupancyPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs text-white font-medium">
                {travel.user.name[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-400">{travel.user.name}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-white">
              <span className="text-violet-400">{formatPrice(travel.pricePerKg)}</span>
              <span className="text-xs text-gray-500 font-normal">/kg</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

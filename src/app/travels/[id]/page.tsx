import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTravel } from "@/actions/travels";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice, TRAVEL_STATUS } from "@/lib/utils";
import {
  Plane, MapPin, Calendar, Weight, Euro, Info, User, Phone, ArrowRight,
} from "lucide-react";
import TravelDetailClient from "./TravelDetailClient";

interface TravelDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TravelDetailPage({ params }: TravelDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  const travel = await getTravel(id);
  if (!travel) notFound();

  const statusInfo = TRAVEL_STATUS[travel.status] ?? TRAVEL_STATUS.ACTIVE;
  const isOwner = currentUserId === travel.userId;
  const occupancyPct = Math.round(
    ((travel.availableKg - travel.remainingKg) / travel.availableKg) * 100
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold text-white">{travel.departureCity}</h1>
          <div className="flex items-center gap-2 text-violet-400">
            <div className="h-px w-12 bg-current" />
            <Plane className="h-5 w-5" />
            <div className="h-px w-12 bg-current" />
          </div>
          <h1 className="text-4xl font-bold text-white">{travel.arrivalCity}</h1>
        </div>
        <p className="text-gray-400">
          {formatDateTime(travel.departureDate)} → {formatDateTime(travel.arrivalDate)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Départ
                </div>
                <p className="text-white font-medium">{formatDateTime(travel.departureDate)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Arrivée
                </div>
                <p className="text-white font-medium">{formatDateTime(travel.arrivalDate)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Euro className="h-3.5 w-3.5" />
                  Prix/kg
                </div>
                <p className="text-violet-400 font-bold text-lg">{formatPrice(travel.pricePerKg)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Weight className="h-3.5 w-3.5" />
                  Disponible
                </div>
                <p className="text-white font-medium">{travel.remainingKg} kg</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Weight className="h-3.5 w-3.5" />
                  Total
                </div>
                <p className="text-white font-medium">{travel.availableKg} kg</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Capacité utilisée</span>
                <span>{occupancyPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{travel.availableKg - travel.remainingKg} kg réservés</span>
                <span>{travel.remainingKg} kg restants</span>
              </div>
            </CardContent>
          </Card>

          {travel.description && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-gray-300 font-medium mb-3">
                  <Info className="h-4 w-4 text-violet-400" />
                  Informations complémentaires
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{travel.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-lg text-white font-bold">
                  {travel.user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{travel.user.name}</p>
                  <p className="text-xs text-gray-500">Transporteur</p>
                </div>
              </div>
              {travel.user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Phone className="h-4 w-4" />
                  {travel.user.phone}
                </div>
              )}
              <TravelDetailClient
                travel={{
                  id: travel.id,
                  remainingKg: travel.remainingKg,
                  pricePerKg: travel.pricePerKg,
                  departureCity: travel.departureCity,
                  arrivalCity: travel.arrivalCity,
                  status: travel.status,
                  userId: travel.userId,
                  user: travel.user,
                }}
                currentUserId={currentUserId}
                isOwner={isOwner}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

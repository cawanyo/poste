import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getReservation } from "@/actions/reservations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice, RESERVATION_STATUS } from "@/lib/utils";
import {
  Package, Plane, ArrowRight, QrCode, CreditCard, MapPin,
  Calendar, Weight, Euro, CheckCircle, Clock
} from "lucide-react";
import MapView from "@/components/MapView";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReservationActions from "./ReservationActions";

// const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const reservation = await getReservation(id);
  if (!reservation) notFound();

  const statusInfo = RESERVATION_STATUS[reservation.status] ?? RESERVATION_STATUS.PENDING;
  const travelUser = reservation.travel.user as { location?: { lat: number; lng: number; city?: string | null } | null; id: string; name: string; avatar?: string | null; phone?: string | null };
  const location = travelUser.location;

  const steps = [
    { label: "Réservé", status: "PENDING", icon: Package },
    { label: "Payé", status: "PAID", icon: CreditCard },
    { label: "En transit", status: "IN_TRANSIT", icon: Plane },
    { label: "Livré", status: "DELIVERED", icon: MapPin },
    { label: "Validé", status: "VALIDATED", icon: CheckCircle },
  ];

  const currentStepIdx = steps.findIndex((s) => s.status === reservation.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {reservation.travel.departureCity} → {reservation.travel.arrivalCity}
        </h1>
        <p className="text-gray-400 text-sm">
          {formatDateTime(reservation.travel.departureDate)}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          {steps.map((step, i) => (
            <div key={step.status} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    i <= currentStepIdx
                      ? "border-violet-500 bg-violet-500/20 text-violet-400"
                      : "border-white/10 bg-white/5 text-gray-600"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <p className={`text-xs mt-1 ${i <= currentStepIdx ? "text-violet-400" : "text-gray-600"}`}>
                  {step.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-5 ${
                    i < currentStepIdx ? "bg-violet-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Détails de la réservation</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Weight className="h-3.5 w-3.5" />
                Kilos
              </span>
              <span className="text-white font-medium">{reservation.kg} kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Euro className="h-3.5 w-3.5" />
                Total
              </span>
              <span className="text-violet-400 font-bold">{formatPrice(reservation.totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Réservé le
              </span>
              <span className="text-white">{formatDateTime(reservation.createdAt)}</span>
            </div>
            {reservation.notes && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-300">{reservation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Code de livraison</h3>
            <div className="text-center">
              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-6 mb-3">
                <QrCode className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                <p className="text-3xl font-mono font-bold text-violet-400 tracking-widest">
                  {reservation.code}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Donnez ce code au transporteur lors de la réception de votre colis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {reservation.status === "PENDING" && (
        <Card className="mb-6 border-yellow-500/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium text-sm">Paiement requis</p>
                <p className="text-xs text-gray-400">
                  Finalisez votre réservation en effectuant le paiement
                </p>
              </div>
            </div>
            <Link href={`/reservations/${reservation.id}/payment`}>
              <Button size="sm" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Payer {formatPrice(reservation.totalPrice)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {location && ["IN_TRANSIT", "DELIVERED"].includes(reservation.status) && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-400" />
              Position du transporteur
            </h3>
            <MapView
              lat={location.lat}
              lng={location.lng}
              city={location.city}
              userName={reservation.travel.user.name}
            />
            <p className="text-xs text-gray-500 mt-2">
              Dernière mise à jour en temps réel
            </p>
          </CardContent>
        </Card>
      )}

      <ReservationActions reservation={reservation} />
    </div>
  );
}

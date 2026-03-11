import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserTravels } from "@/actions/travels";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, TRAVEL_STATUS, RESERVATION_STATUS } from "@/lib/utils";
import { Plane, Package, Euro, Users, ArrowRight, Plus, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ValidateCodeClient from "./ValidateCodeClient";
import UpdateStatusClient from "./UpdateStatusClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const travels = await getUserTravels();

  const totalRevenue = travels
    .flatMap((t) => t.reservations)
    .filter((r) => r.status === "VALIDATED")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const pendingValidations = travels
    .flatMap((t) => t.reservations)
    .filter((r) => r.status === "DELIVERED").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez vos voyages et réservations</p>
        </div>
        <Link href="/travels/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau voyage
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Plane className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{travels.length}</p>
              <p className="text-xs text-gray-400">Voyages postés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {travels.reduce((sum, t) => sum + t._count.reservations, 0)}
              </p>
              <p className="text-xs text-gray-400">Réservations reçues</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Euro className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              <p className="text-xs text-gray-400">Revenus validés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingValidations > 0 && (
        <div className="mb-6 rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
          <p className="text-orange-400 font-medium text-sm">
            {pendingValidations} livraison(s) en attente de validation par code
          </p>
        </div>
      )}

      <ValidateCodeClient />

      <div className="space-y-8">
        {travels.map((travel) => {
          const statusInfo = TRAVEL_STATUS[travel.status] ?? TRAVEL_STATUS.ACTIVE;
          return (
            <Card key={travel.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Plane className="h-4 w-4 text-violet-400" />
                      {travel.departureCity}
                      <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                      {travel.arrivalCity}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(travel.departureDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UpdateStatusClient travelId={travel.id} currentStatus={travel.status} />
                    <Link href={`/travels/${travel.id}`}>
                      <Button variant="outline" size="sm">Voir</Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span>{travel.remainingKg} kg restants / {travel.availableKg} kg</span>
                  <span>{formatPrice(travel.pricePerKg)}/kg</span>
                </div>

                {travel.reservations.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-3 flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      Réservations ({travel.reservations.length})
                    </p>
                    <div className="space-y-2">
                      {travel.reservations.map((res) => {
                        const resStatus = RESERVATION_STATUS[res.status] ?? RESERVATION_STATUS.PENDING;
                        return (
                          <div
                            key={res.id}
                            className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={resStatus.color + " text-xs"}>{resStatus.label}</Badge>
                              <span className="text-gray-300">{res.kg} kg</span>
                              <span className="text-violet-400">{formatPrice(res.totalPrice)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <QrCode className="h-3.5 w-3.5" />
                              <span className="font-mono text-violet-400">{res.code}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {travels.length === 0 && (
          <div className="text-center py-16">
            <Plane className="h-14 w-14 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium text-gray-400">Aucun voyage posté</p>
            <p className="text-sm text-gray-600 mb-6">Commencez à partager vos voyages</p>
            <Link href="/travels/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Poster mon premier voyage
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

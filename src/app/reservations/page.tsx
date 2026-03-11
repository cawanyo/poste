import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserReservations } from "@/actions/reservations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, RESERVATION_STATUS } from "@/lib/utils";
import { Package, Plane, ArrowRight, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ReservationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const reservations = await getUserReservations();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mes réservations</h1>
          <p className="text-gray-400 text-sm mt-1">Suivez l&apos;état de vos colis</p>
        </div>
        <div className="text-sm text-gray-500">{reservations.length} réservation(s)</div>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-14 w-14 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">Aucune réservation</p>
          <p className="text-sm text-gray-600 mb-6">Explorez les voyages disponibles</p>
          <Link href="/travels">
            <Button>Explorer les voyages</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const statusInfo = RESERVATION_STATUS[res.status] ?? RESERVATION_STATUS.PENDING;
            return (
              <Link key={res.id} href={`/reservations/${res.id}`}>
                <Card className="hover:border-violet-500/30 transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(res.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-semibold mb-2">
                          <Plane className="h-4 w-4 text-violet-400" />
                          {res.travel.departureCity}
                          <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                          {res.travel.arrivalCity}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{res.kg} kg</span>
                          <span className="text-violet-400 font-medium">
                            {formatPrice(res.totalPrice)}
                          </span>
                          <span>Transporteur: {res.travel.user.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <QrCode className="h-3.5 w-3.5" />
                          Code
                        </div>
                        <p className="font-mono font-bold text-violet-400 text-sm">{res.code}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

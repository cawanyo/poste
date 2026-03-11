import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getReservation } from "@/actions/reservations";
import PaymentPageClient from "./PaymentPageClient";

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const reservation = await getReservation(id);
  if (!reservation) notFound();
  if (reservation.status !== "PENDING") redirect(`/reservations/${id}`);

  return (
    <PaymentPageClient
      reservation={{
        id: reservation.id,
        totalPrice: reservation.totalPrice,
        kg: reservation.kg,
        code: reservation.code,
        travel: {
          departureCity: reservation.travel.departureCity,
          arrivalCity: reservation.travel.arrivalCity,
        },
      }}
    />
  );
}

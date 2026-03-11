"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentInput } from "@/lib/validations";
import { processPayment } from "@/actions/reservations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

interface PaymentPageClientProps {
  reservation: {
    id: string;
    totalPrice: number;
    kg: number;
    code: string;
    travel: { departureCity: string; arrivalCity: string };
  };
}

export default function PaymentPageClient({ reservation }: PaymentPageClientProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { reservationId: reservation.id },
  });

  async function onSubmit(data: PaymentInput) {
    setError("");
    const res = await processPayment(data);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push(`/reservations/${reservation.id}`), 2000);
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Paiement réussi !</h2>
          <p className="text-gray-400">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 mb-4">
          <CreditCard className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Paiement sécurisé</h1>
        <p className="text-gray-400 text-sm mt-1">
          {reservation.travel.departureCity} → {reservation.travel.arrivalCity}
        </p>
      </div>

      <Card className="mb-4 border-violet-500/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total à payer</p>
            <p className="text-2xl font-bold text-violet-400">{formatPrice(reservation.totalPrice)}</p>
          </div>
          <div className="text-right text-sm text-gray-400">
            <p>{reservation.kg} kg réservés</p>
            <p className="text-xs text-gray-600">Code: <span className="text-violet-400 font-mono">{reservation.code}</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-400" />
            Informations de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("reservationId")} />

            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Numéro de carte</label>
              <Input
                {...register("cardNumber")}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber.message}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Nom sur la carte</label>
              <Input {...register("cardName")} placeholder="JEAN DUPONT" />
              {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Expiration</label>
                <Input {...register("expiry")} placeholder="MM/AA" maxLength={5} />
                {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry.message}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">CVV</label>
                <Input {...register("cvv")} type="password" placeholder="•••" maxLength={4} />
                {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-500/5 border border-green-500/10 rounded-xl px-3 py-2.5">
              <Lock className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
              Le paiement est sécurisé et bloqué jusqu&apos;à la validation de la livraison
            </div>

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full gap-2">
              <CreditCard className="h-4 w-4" />
              {isSubmitting ? "Traitement..." : `Payer ${formatPrice(reservation.totalPrice)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

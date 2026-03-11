"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationInput } from "@/lib/validations";
import { createReservation } from "@/actions/reservations";
// Remplacement des imports Dialog par Sheet
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Weight, Euro, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReservationSheetProps {
  open: boolean;
  onClose: () => void;
  travel: {
    id: string;
    remainingKg: number;
    pricePerKg: number;
    departureCity: string;
    arrivalCity: string;
  };
}

export default function ReservationSheet({ open, onClose, travel }: ReservationSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [code, setCode] = useState("");
  const [reservationId, setReservationId] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({ 
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      kg: 0
    }
  });

  const kg = watch("kg") ?? 0;
  const total = kg * travel.pricePerKg;

  async function onSubmit(data: ReservationInput) {
    if (data.kg > travel.remainingKg) return;
    const res = await createReservation(travel.id, data);
    if (res.error) return alert(res.error);
    setCode(res.code!);
    setReservationId(res.id!);
    setStep("success");
  }

  function goToPayment() {
    router.push(`/reservations/${reservationId}/payment`);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      {/* side="right" est la valeur par défaut, vous pouvez mettre "bottom" sur mobile */}
      <SheetContent className="sm:max-w-md overflow-y-auto">
        {step === "form" ? (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl">Réserver des kilos</SheetTitle>
              <SheetDescription>
                {travel.departureCity} → {travel.arrivalCity}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Nombre de kilos (max {travel.remainingKg} kg)
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    {...register("kg", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    max={travel.remainingKg}
                    placeholder="Ex: 5"
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
                {errors.kg && <p className="text-red-400 text-xs">{errors.kg.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Notes (optionnel)</label>
                <Textarea
                  {...register("notes")}
                  placeholder="Description du colis, fragile, etc."
                  rows={4}
                  className="bg-white/5 border-white/10 resize-none"
                />
              </div>

              {kg > 0 && (
                <div className="rounded-2xl bg-violet-600/10 border border-violet-600/20 p-5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total estimé</span>
                    <div className="flex items-center gap-1 text-2xl font-bold text-violet-400">
                      <Euro className="h-5 w-5" />
                      {total.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-wider">
                    {kg} kg × {formatPrice(travel.pricePerKg)} / kg
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting || kg <= 0} className="w-full h-12 text-base">
                  {isSubmitting ? "Traitement en cours..." : "Confirmer la réservation"}
                </Button>
                <Button type="button" variant="ghost" onClick={onClose} className="w-full text-gray-400">
                  Annuler
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Réservation créée !</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Votre réservation a été enregistrée avec succès. Voici votre code de sécurité unique.
            </p>

            <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-semibold">
                Code de livraison
              </p>
              <p className="text-4xl font-mono font-bold text-violet-400 tracking-[0.3em]">
                {code}
              </p>
            </div>

            <p className="text-xs text-gray-500 mb-10 italic">
              Important : Communiquez ce code au transporteur uniquement après avoir reçu votre colis.
            </p>

            <Button onClick={goToPayment} className="w-full h-12 text-base">
              Procéder au paiement
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
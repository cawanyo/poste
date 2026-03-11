"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { travelSchema, type TravelInput } from "@/lib/validations";
import { createTravel } from "@/actions/travels";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Weight, Euro, FileText, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewTravelPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TravelInput>({ resolver: zodResolver(travelSchema) });

  async function onSubmit(data: TravelInput) {
    const res = await createTravel(data);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Voyage créé avec succès !");
    router.push(`/travels/${res.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Poster un voyage</h1>
        </div>
        <p className="text-gray-400 text-sm ml-13">
          Partagez votre trajet et rentabilisez vos kilos disponibles
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-400" />
              Itinéraire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Ville de départ *</label>
              <Input
                {...register("departureCity")}
                placeholder="Ex: Paris, CDG"
              />
              {errors.departureCity && (
                <p className="text-red-400 text-xs mt-1">{errors.departureCity.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Ville d&apos;arrivée *</label>
              <Input
                {...register("arrivalCity")}
                placeholder="Ex: Abidjan, ABJ"
              />
              {errors.arrivalCity && (
                <p className="text-red-400 text-xs mt-1">{errors.arrivalCity.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Dates & Heures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Date de départ *</label>
                <Input {...register("departureDate")} type="date" />
                {errors.departureDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.departureDate.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Heure de départ *</label>
                <Input {...register("departureTime")} type="time" />
                {errors.departureTime && (
                  <p className="text-red-400 text-xs mt-1">{errors.departureTime.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Date d&apos;arrivée *</label>
                <Input {...register("arrivalDate")} type="date" />
                {errors.arrivalDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.arrivalDate.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Heure d&apos;arrivée *</label>
                <Input {...register("arrivalTime")} type="time" />
                {errors.arrivalTime && (
                  <p className="text-red-400 text-xs mt-1">{errors.arrivalTime.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Weight className="h-4 w-4 text-green-400" />
              Capacité & Tarif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Kilos disponibles *</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...register("availableKg")}
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="Ex: 10"
                  className="pl-10"
                />
              </div>
              {errors.availableKg && (
                <p className="text-red-400 text-xs mt-1">{errors.availableKg.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Prix par kilo (€) *</label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...register("pricePerKg")}
                  type="number"
                  step="0.5"
                  min="1"
                  placeholder="Ex: 5"
                  className="pl-10"
                />
              </div>
              {errors.pricePerKg && (
                <p className="text-red-400 text-xs mt-1">{errors.pricePerKg.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-yellow-400" />
              Informations complémentaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("description")}
              placeholder="Précisez le type de colis accepté, restrictions, instructions de livraison..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full gap-2">
          <Plane className="h-4 w-4" />
          {isSubmitting ? "Publication en cours..." : "Publier le voyage"}
        </Button>
      </form>
    </div>
  );
}

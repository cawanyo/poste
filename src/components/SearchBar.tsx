"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchSchema, type SearchInput } from "@/lib/validations";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  const { register, handleSubmit } = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      departureCity: params.get("departureCity") ?? "",
      arrivalCity: params.get("arrivalCity") ?? "",
      date: params.get("date") ?? "",
    },
  });

  function onSubmit(data: SearchInput) {
    const sp = new URLSearchParams();
    if (data.departureCity) sp.set("departureCity", data.departureCity);
    if (data.arrivalCity) sp.set("arrivalCity", data.arrivalCity);
    if (data.date) sp.set("date", data.date);
    router.push(`/travels?${sp.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-3 w-full"
    >
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          {...register("departureCity")}
          placeholder="Ville de départ"
          className="pl-10"
        />
      </div>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
        <Input
          {...register("arrivalCity")}
          placeholder="Ville d'arrivée"
          className="pl-10"
        />
      </div>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input {...register("date")} type="date" className="pl-10" />
      </div>
      <Button type="submit" className="gap-2 shrink-0">
        <Search className="h-4 w-4" />
        Rechercher
      </Button>
    </form>
  );
}

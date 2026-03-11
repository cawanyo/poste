"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateDelivery } from "@/actions/reservations";
import { QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ValidateCodeClient() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ code: string }>();

  async function onSubmit({ code }: { code: string }) {
    setLoading(true);
    const res = await validateDelivery(code.trim().toUpperCase());
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Livraison validée ! Le paiement a été libéré.");
      reset();
    }
  }

  return (
    <Card className="mb-8 border-violet-500/20">
      <CardContent className="p-5">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-violet-400" />
          Valider une livraison
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Saisissez le code fourni par le destinataire pour confirmer la livraison et recevoir votre paiement
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
          <Input
            {...register("code")}
            placeholder="Ex: ABC12345"
            className="flex-1 font-mono uppercase"
            maxLength={8}
          />
          <Button type="submit" disabled={loading} className="gap-2 shrink-0">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Validation..." : "Valider"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

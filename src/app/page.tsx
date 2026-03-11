import Link from "next/link";
import { Suspense } from "react";
import { Plane, Package, Shield, Zap, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";
import TravelCard from "@/components/TravelCard";
import { getTravels } from "@/actions/travels";

async function RecentTravels() {
  const travels = await getTravels();
  const recent = travels.slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recent.map((travel) => (
        <TravelCard key={travel.id} travel={travel} />
      ))}
      {recent.length === 0 && (
        <div className="col-span-3 text-center py-16 text-gray-500">
          <Plane className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucun voyage disponible pour le moment</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400 mb-8">
            <Zap className="h-3.5 w-3.5" />
            Plateforme de livraison collaborative
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Envoyez vos colis{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 animate-gradient">
              avec des voyageurs
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connectez-vous à des voyageurs qui ont de l&apos;espace disponible dans leurs bagages.
            Économisez sur les frais de livraison, rapidement et en toute sécurité.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/travels">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Explorer les voyages <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/travels/new">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                <Plane className="h-4 w-4" />
                Poster mon voyage
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6">
            <p className="text-sm text-gray-400 mb-4 font-medium">Rechercher un voyage</p>
            <Suspense fallback={<div className="h-11 rounded-xl bg-white/5 animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: Shield,
                title: "Sécurisé",
                desc: "Paiement bloqué jusqu'à la validation de la livraison par un code unique",
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
              {
                icon: Zap,
                title: "Temps réel",
                desc: "Suivez la position du transporteur et recevez des notifications instantanées",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
              },
              {
                icon: Star,
                title: "Économique",
                desc: "Des tarifs bien inférieurs aux services de livraison classiques",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Voyages récents</h2>
              <p className="text-gray-400 text-sm mt-1">Trouvez un voyageur pour votre colis</p>
            </div>
            <Link href="/travels">
              <Button variant="outline" size="sm" className="gap-2">
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            }
          >
            <RecentTravels />
          </Suspense>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-8 sm:p-12 text-center">
            <Package className="h-12 w-12 text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Vous voyagez bientôt ?
            </h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Rentabilisez vos kilos disponibles en transportant des colis sur votre trajet.
            </p>
            <Link href="/travels/new">
              <Button size="lg" className="gap-2">
                <Plane className="h-4 w-4" />
                Poster mon voyage
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

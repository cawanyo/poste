import { Suspense } from "react";
import { getTravels } from "@/actions/travels";
import TravelCard from "@/components/TravelCard";
import SearchBar from "@/components/SearchBar";
import { Plane, SlidersHorizontal } from "lucide-react";

interface TravelsPageProps {
  searchParams: Promise<{ departureCity?: string; arrivalCity?: string; date?: string }>;
}

async function TravelsList({ params }: { params: { departureCity?: string; arrivalCity?: string; date?: string } }) {
  const travels = await getTravels(params);

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">
        {travels.length} voyage{travels.length !== 1 ? "s" : ""} trouvé{travels.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {travels.map((travel) => (
          <TravelCard key={travel.id} travel={travel} />
        ))}
        {travels.length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-500">
            <Plane className="h-14 w-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-400">Aucun voyage trouvé</p>
            <p className="text-sm mt-1">Essayez d&apos;autres critères de recherche</p>
          </div>
        )}
      </div>
    </>
  );
}

export default async function TravelsPage({ searchParams }: TravelsPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="h-4 w-4 text-violet-400" />
          <span className="text-sm text-violet-400 font-medium">Filtres</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-6">Voyages disponibles</h1>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        }
      >
        <TravelsList params={params} />
      </Suspense>
    </div>
  );
}

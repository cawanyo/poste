import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentUser } from "@/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-3xl text-white font-bold mx-auto mb-4">
          {user.name[0]?.toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 py-3 border-b border-white/10">
            <User className="h-4 w-4 text-violet-400" />
            <div>
              <p className="text-xs text-gray-500">Nom</p>
              <p className="text-white text-sm">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3 border-b border-white/10">
            <Mail className="h-4 w-4 text-violet-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-white text-sm">{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 py-3 border-b border-white/10">
              <Phone className="h-4 w-4 text-violet-400" />
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="text-white text-sm">{user.phone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Plane,
  Menu,
  X,
  User,
  LogOut,
  Plus,
  Package,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Voyage<span className="text-violet-400">Cargo</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/travels"
              className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Voyages
            </Link>
            {session?.user && (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/reservations"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Réservations
                </Link>
                <Link
                  href="/messages"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Messages
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/travels/new">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Poster un voyage
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs text-white font-medium">
                      {session.user.name?.[0]?.toUpperCase()}
                    </div>
                    <span>{session.user.name}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-gray-900 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-t-xl transition-all"
                    >
                      <User className="h-4 w-4" />
                      Profil
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-950 px-4 py-4 space-y-2">
          <Link
            href="/travels"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <Plane className="h-4 w-4" />
            Voyages
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/travels/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-white bg-violet-600 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Poster un voyage
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/reservations"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <Package className="h-4 w-4" />
                Réservations
              </Link>
              <Link
                href="/messages"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Messages
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="flex px-4 py-3 text-sm text-white bg-violet-600 rounded-xl"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoyageCargo — Envoyez vos colis avec des voyageurs",
  description: "Plateforme de transport de colis entre particuliers via des voyageurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased bg-gray-950 text-white min-h-screen `}>
        <Providers>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

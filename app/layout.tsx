import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";

import "./globals.css";

// Polices
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["400", "700"], // normal et bold
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "Next'Jobs – Trouvez un emploi facilement",
    template: "%s | Next'Jobs",
  },
  description:
    "Next'Jobs est un jobboard moderne et simple d'utilisation. Trouvez un emploi, un stage ou une alternance dans tous les secteurs : commerce, santé, industrie, services, restauration et plus encore.",
  keywords: [
    "emploi",
    "job",
    "jobboard",
    "recrutement",
    "offres d'emploi",
    "travail",
    "stage",
    "alternance",
    "Next'Jobs",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ExternalLink, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DetailCompany = () => {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCompany = async () => {
      try {
        const { data, error } = await supabase
          .from("recruiters")
          .select()
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        setCompany(data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Erreur lors de la récupération de l'entreprise:", error);
        }
        Sentry.captureException(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center text-gray-600">
          <p>Chargement de l'entreprise...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center text-gray-600">
          <p>Entreprise introuvable</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 md:px-0 mt-6">
        {/* Bouton retour */}
        <div className="w-full max-w-[900px] flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm sm:text-[15px] px-3 py-2 rounded-md text-gray-600 font-medium hover:bg-gray-100 transition">
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </button>
        </div>

        {/* Bloc principal entreprise */}
        <div className="w-full max-w-[900px] rounded-xl bg-white flex flex-col md:flex-row items-center md:items-start p-6 shadow-sm hover:shadow-md transition-shadow">
          {/* Logo */}
          <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-lg flex items-center justify-center bg-gray-100 mb-4 md:mb-0 md:mr-6 shrink-0 overflow-hidden">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt="Logo de l'entreprise"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Pas de logo
              </div>
            )}
          </div>

          {/* Infos entreprise */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {company.company_name}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mb-3">
              {company.sector || "Secteur non renseigné"}
            </p>

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center md:justify-start gap-2 sm:gap-6 mb-4 text-gray-500 text-sm sm:text-base">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <p>{company.location || "Non précisée"}</p>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <p>{company.size || "Taille inconnue"} employés</p>
              </div>
            </div>

            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center md:justify-start"
              >
             <button className="flex items-center gap-2 bg-[#4d307cff] text-white text-sm sm:text-[15px] px-4 py-2 rounded-md hover:bg-[#3b2560] transition">
                  <ExternalLink className="w-4 h-4" />
                  Visitez le site web
                </button>
              </a>
            )}
          </div>
        </div>

        {/* Section "À propos" */}
      <div className="w-full max-w-[900px] rounded-xl bg-white mt-6 mb-6 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-gray-900">
            À propos de l'entreprise
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            {company.description || "Aucune description disponible."}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetailCompany;

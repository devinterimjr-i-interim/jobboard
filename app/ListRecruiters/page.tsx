"use client";

import * as Sentry from "@sentry/nextjs";
import { Header } from "@/components/Header";
import { Building2, MapPin, Users, Search, Factory, Briefcase } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const violet = "#27142d";
const borderGray = "#e5e6ed";

// Hook pour gérer les recruteurs
export function useRecruiters() {
  const [listRecruiters, setListRecruiters] = useState<any[]>([]);
  const [inputSearch, setInputSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Récupération des recruteurs approuvés
  const fetchRecruiters = async () => {
    try {
      const { data, error } = await supabase
        .from("recruiters")
        .select()
        .eq("status", "approved");
      if (error) throw error;
      setListRecruiters(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erreur récupération recruteurs:", error);
      }
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  // Vérification de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth"); // redirige vers la page de connexion
      } else {
        fetchRecruiters(); // récupère les recruteurs
      }
    };

    checkAuth();
  }, [router]);

  // Filtrage selon la recherche
  const filteredRecruiters = listRecruiters.filter((elem) => {
    const search = inputSearch.toLowerCase();
    return (
      elem.company_name?.toLowerCase().includes(search) ||
      elem.sector?.toLowerCase().includes(search) ||
      elem.location?.toLowerCase().includes(search)
    );
  });

  return {
    listRecruiters,
    filteredRecruiters,
    inputSearch,
    setInputSearch,
    loading,
    violet,
    borderGray,
  };
}

// Composant principal
export const ListRecruiters = () => {
  const {
    filteredRecruiters,
    inputSearch,
    setInputSearch,
    loading,
    violet,
    borderGray,
  } = useRecruiters();

  if (loading) {
    return <p className="text-center mt-20 text-gray-500">Chargement…</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-10 pb-12">

        {/* HEADER SECTION */}
        <div className="w-full max-w-7xl flex flex-col gap-4 mt-10 mb-10 items-center">
          <div className="p-4 rounded-xl flex justify-center items-center w-24 h-24 sm:w-28 sm:h-28">
            <Briefcase className="w-15 h-15" style={{ color: violet }} />
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-[46px] text-center sm:text-[60px] font-semibold text-gray-900">
              Entreprises qui recrutent
            </h1>
          </div>
          <p className="text-gray-500 text-center text-base sm:text-lg max-w-2xl">
            Découvrez les entreprises qui recrutent activement et explorez leurs opportunités de carrière.
            Trouvez l'employeur qui correspond à vos ambitions professionnelles.
          </p>
        </div>

        {/* INPUT RECHERCHE */}
        <div className="w-full max-w-3xl mb-12">
          <div
            className="flex items-center gap-2 bg-white px-4 py-3 shadow-sm focus-within:ring-2 transition-all rounded-lg"
            style={{ borderColor: borderGray }}
          >
            <Search className="w-5 h-5 text-gray-400 ml-1" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              className="w-full h-10 border-none focus:ring-0 outline-none text-sm rounded-lg px-3"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
            />
          </div>
        </div>

        {/* LISTE DES ENTREPRISES */}
        <div className="w-full max-w-7xl">
          <div
            className="flex items-center gap-3 border-b pb-3 mb-10"
            style={{ borderColor: borderGray }}
          >
            <Factory className="w-6 h-6" style={{ color: violet }} />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Toutes les entreprises
            </h2>
          </div>

          <div className="space-y-6">
            {filteredRecruiters.length === 0 ? (
              <p className="text-gray-500">Aucune entreprise trouvée.</p>
            ) : (
              filteredRecruiters.map((elem) => (
                <div
                  key={elem.id ?? elem.company_name}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6 flex flex-col sm:flex-row gap-6 border"
                  style={{ borderColor: borderGray }}
                >
                  {/* LOGO */}
                  <div className="flex-shrink-0 w-full sm:w-36 h-28 flex justify-center items-center">
                    <div
                      className="w-20 h-20 rounded-xl flex justify-center items-center overflow-hidden"
                      style={{ backgroundColor: borderGray }}
                    >
                      {elem.logo_url && (
                        <img
                          src={elem.logo_url}
                          alt={elem.company_name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* CONTENU */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {elem.company_name || "—"}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          color: violet,
                          backgroundColor: "#eceef5",
                        }}
                      >
                        {elem.sector || "Secteur non renseigné"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                      {elem.description?.length > 120
                        ? elem.description.slice(0, 120) + "..."
                        : elem.description || ""}
                    </p>

                    <div className="flex flex-wrap gap-6 mt-4 text-gray-700 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#eceef5]">
                          <MapPin className="w-4 h-4" style={{ color: violet }} />
                        </div>
                        <span>{elem.location || "Contact non renseigné"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#eceef5]">
                          <Users className="w-4 h-4" style={{ color: violet }} />
                        </div>
                        <span>{elem.size || "—"} employés</span>
                      </div>
                    </div>
                  </div>

                  {/* BOUTON */}
                  <div className="flex justify-center items-center">
                    <Link
                      href={`/DetailCompany/${elem.id}`}
                      className="px-6 py-2.5 rounded-full bg-[#4d307cff] flex items-center justify-center shadow hover:bg-[#371f7a] hover:scale-105 transition-all duration-300"
                    >
                      <p className="text-white text-sm font-semibold">
                        Voir le profil recruteur
                      </p>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListRecruiters;

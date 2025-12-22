"use client";
import * as Sentry from "@sentry/nextjs";
import React, { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import { Briefcase, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

type Profile = {
  id: string;
  full_name: string;
  cv_public?: string | null;
  desired_job?: string | null;
};

const CvTech = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  async function isRecruiter(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      if (error) {
        Sentry.captureException(error);
        return false;
      }
      return !!data && data.length > 0;
    } catch (err) {
      Sentry.captureException(err);
      return false;
    }
  }

  async function openCv(cvPath: string | undefined) {
    if (!cvPath) return;
    const { data, error } = await supabase.storage
      .from('cv_public')
      .createSignedUrl(cvPath, 60);
    if (error) {
      console.error(error);
      return alert("Impossible d’ouvrir le document");
    }
    window.open(data.signedUrl);
  }

  async function fetchProfiles() {
    const recruiter = await isRecruiter();
    if (!recruiter) return;
    try {
      const { data, error } = await supabase
        .from<Profile>('profiles')
        .select('*')
        .not('cv_public', 'is', null);
      if (error) {
        Sentry.captureException(error);
        return;
      }
      setProfiles(data || []);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Filtrage par desired_job uniquement
  const filteredProfiles = profiles.filter(profile =>
    profile.desired_job?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Header />

      <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-0 mt-6 pb-[25px]">
        {/* Header section */}
        <div className="w-full max-w-6xl flex flex-col justify-center items-start mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">CV Publics</h1>
          <p className="text-gray-500 mt-1">Découvrez les talents disponibles</p>
        </div>

        {/* Search input */}
        <div className="w-full max-w-6xl mb-8">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par poste"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-10 pr-4 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4d307cff] transition"
            />
          </div>
        </div>

        {/* Profiles grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun CV public disponible</p>
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-200"
              >
                <div>
                  <p className="text-[16px] font-normal text-gray-500">
                    {profile.full_name}
                  </p>
                  <p className="text-[21px] text-[#4d307cff] font-semibold mt-2">
                    {profile.desired_job || "Métier inconnu"}
                  </p>
                </div>

                <button
                  onClick={() => openCv(profile.cv_public)}
                  className="mt-4 bg-[#4d307cff] text-white py-2 rounded-lg font-semibold hover:bg-[#3b2560] transition-colors flex items-center justify-center gap-2 border-0"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le CV
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CvTech;

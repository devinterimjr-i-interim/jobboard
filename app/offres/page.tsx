'use client';

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";

interface Job {
  id: string;
  title: string;
  sector: string;
  location: string;
  type: string;
  salary_range?: string;
  recruiters?: {
    logo_url?: string;
    company_name?: string;
  };
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [recommandationsJob, setRecommandationsJob] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start", skipSnaps: false });
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Vérifie si l'utilisateur est connecté
useEffect(() => {
  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();

    // connecté → id
    // pas connecté → null (normal)
    setUserId(data?.user?.id ?? null);
  };

  checkUser();
}, []);

const slugify = (text: string) => 
  text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("jobs").select("*").eq("is_valid", true);
        if (error) throw error;
        setJobs(data || []);
      } catch (error: any) {
        console.error("Erreur récupération jobs :", error);
        if (process.env.NODE_ENV === "production") Sentry.captureException(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  
  // Recommendations
  useEffect(() => {
    const jobRecommandation = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase.from("user_sector").select();
        if (error) throw error;

        const userSectors = data?.filter((elem) => elem.user_id === userId) || [];
        const sectorIds = userSectors.map((elem) => elem.sector_id);
        if (sectorIds.length === 0) return;

        const { data: tabRecommandation, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .in("sector_id", sectorIds)
          .eq("is_valid", true);

        if (jobError) throw jobError;

        setRecommandationsJob(tabRecommandation || []);
      } catch (error: any) {
        console.error("Erreur recommandations :", error);
        if (process.env.NODE_ENV === "production") Sentry.captureException(error);
      }
    };
    if (userId) jobRecommandation();
  }, [userId]);

  // Filtrage pour la recherche
  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.sector?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase())
  );

  // Lecture du paramètre 'text' côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryText = params.get("text") || "";
      setSearch(queryText);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header page */}
          <div className="flex justify-center flex-col items-center h-[250px] sm:h-[140px]">
            <h1 className="text-[48px] font-bold text-center">Offres d'emploi</h1>
            <p className="text-[18px] text-gray-500 mt-2 text-center">
              Trouvez votre prochain emploi parmi les meilleures opportunités.
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="mb-8 relative w-full flex justify-center">
            <div className="relative w-full max-w-[680px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par titre, secteur ou localisation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-[52px] w-full pl-12 border border-gray-200 rounded-md focus:border-indigo-400 focus:ring-0 shadow-sm"
              />
            </div>
          </div>

          {/* Recommandations */}
          {recommandationsJob.length > 0 && (
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3 sm:gap-0 w-full">
                <div className="flex items-center text-center sm:text-left">
                  <Sparkles className="text-[#7B59F2] w-5 h-5 sm:w-6 sm:h-6 mr-2 shrink-0" />
                  <h2 className="text-[27px] font-bold">Recommandations</h2>
                </div>

                <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-center sm:justify-start">
                  <Button
                    size="icon"
                    onClick={scrollPrev}
                    className="rounded-full shadow bg-white/90 w-9 h-9 sm:w-10 sm:h-10 border-none">
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={scrollNext}
                    className="rounded-full shadow bg-white/90 w-9 h-9 sm:w-10 sm:h-10 border-none"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden h-auto sm:h-[380px]" ref={emblaRef}>
                <div className="flex gap-4 sm:gap-6">
                  {recommandationsJob.map((job) => (
                    <div
                      key={job.id}
                      className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                    >
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Toutes les offres */}
          <div className="flex items-center mb-4">
            <Sparkles className="text-primary w-5 h-5 mr-2" />
            <h2 className="text-[27px] font-bold">Toutes les offres</h2>
          </div>

          {/* Liste des offres */}
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p>Chargement des offres...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {search
                  ? "Aucune offre ne correspond à votre recherche."
                  : "Aucune offre disponible pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;

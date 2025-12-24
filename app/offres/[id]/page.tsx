"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Euro, ArrowLeft, MessageCircle, Twitter, Facebook, Linkedin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";
import * as Sentry from "@sentry/nextjs";

interface Job {
  id: string;
  title: string;
  sector: string;
  location: string;
  type: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  recruiter_id?: string;
  recruiters?: {
    id: string;
    logo_url?: string;
    company_name?: string;
  };
}
interface ApplicationFormProps {
  jobId: string;
  jobTitle?: string; // Ajouter cette ligne si tu veux passer le titre
}
const JobDetail = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Fetch job details
  useEffect(() => {
    if (!id) return;
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`*, recruiters(id, logo_url, company_name)`)
        .eq("id", id)
        .single();
      if (error) throw error;
      setJob(data);
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") console.error(error);
      Sentry.captureException(error);
      navigate.push("/offres");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate.push("/auth");
      return;
    }
    setShowApplicationForm(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">Offre non trouvée</p>
            <Link href="/offres">
              <Button>Retour aux offres</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showApplicationForm) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Button
              variant="ghost"
              onClick={() => setShowApplicationForm(false)}
              className="mb-6 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'offre
            </Button>
            <ApplicationForm jobId={job.id} jobTitle={job.title} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">

          {/* Retour aux offres */}
          <Link href="/offres">
            <Button variant="ghost" className="mb-6 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux offres
            </Button>
          </Link>

          {/* Card offre */}
          <Card className="border border-gray-100 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-2xl sm:text-3xl font-bold break-words">
                    {job.title}
                  </CardTitle>
                  {job.sector && (
                    <Badge className="text-sm bg-gray-200 text-[#4d307cff]">
                      {job.sector}
                    </Badge>
                  )}
                </div>
                {job.recruiters?.logo_url && (
                  <img
                    src={job.recruiters.logo_url}
                    alt={job.recruiters.company_name || "Logo entreprise"}
                    className="h-16 w-16 object-contain rounded-lg"
                  />
                )}
              </div>

              {/* Infos du poste */}
              <div className="flex flex-wrap gap-4 text-gray-600 text-sm sm:text-base">
                <div className="flex items-center gap-1"><MapPin className="h-5 w-5" /> {job.location}</div>
                <div className="flex items-center gap-1"><Briefcase className="h-5 w-5" /> {job.type}</div>
                {job.salary_range && (
                  <div className="flex items-center gap-1">{job.salary_range}K<Euro className="h-5 w-5" /> </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Description du poste</h3>
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Profil recherché */}
              {job.requirements && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Profil recherché</h3>
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleApply}
                  size="lg"
                  className="bg-[#4d307cff] text-white font-semibold w-full sm:w-2/3"
                >
                  Postuler à cette offre
                </Button>
                {job.recruiters?.id && (
                  <Link href={`/DetailCompany/${job.recruiters.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-300">
                      Voir profil recruteur
                    </Button>
                  </Link>
                )}
              </div>

              {/* Partage */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2 text-center sm:text-left">Partager cette offre</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank")}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, "_blank")}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`, "_blank")}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;

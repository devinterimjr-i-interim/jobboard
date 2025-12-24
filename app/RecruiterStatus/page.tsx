"use client";

import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Users,
  Eye,
  FileText,
  Upload,
  Image as ImageIcon,
  Trash2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface RecruiterStats {
  totalJobs: number;
  totalApplications: number;
}

interface Application {
  id: string;
  full_name: string;
  email: string;
  cv_url: string;
  created_at: string;
  jobs?: { title: string }[] | null; // <-- tableau
  message?: string | null;
}


interface JobWithApplications {
  id: string;
  title: string;
  created_at: string;
  application_count: number;
  is_active:boolean;
}

export default function RecruiterStatus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RecruiterStats>({ totalJobs: 0, totalApplications: 0 });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [allJobs, setAllJobs] = useState<JobWithApplications[]>([]);
  const [selectedJobApplications, setSelectedJobApplications] = useState<Application[]>([]);
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showLogoDialog, setShowLogoDialog] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [recruiterStatus, setRecruiterStatus] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "accept" | "decline"; id: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirection si non connecté
  useEffect(() => {
    if (!authLoading && !user) navigate.push("/auth");
  }, [authLoading, user, navigate]);

  // Vérifie le statut recruteur et récupère les données
  useEffect(() => {
    if (user) checkRecruiterStatusAndFetchData();
  }, [user]);

  const checkRecruiterStatusAndFetchData = async () => {
    try {
      const { data: recruiterData, error } = await supabase
        .from("recruiters")
        .select("id, status, logo_url, company_name")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      if (!recruiterData) {
        toast({ title: "Accès refusé", description: "Vous devez être inscrit en tant que recruteur.", variant: "destructive" });
        navigate.push("/recruteur");
        return;
      }

      setCompanyName(recruiterData.company_name || null);
      setRecruiterStatus(recruiterData.status);
      setRecruiterId(recruiterData.id);
      setLogoUrl(recruiterData.logo_url);

      if (recruiterData.status === "approved") await fetchDashboardData(recruiterData.id);
    } catch (error: any) {
      Sentry.captureException(error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
const fetchDashboardData = async (recruiterId: string) => {
  try {
    // Récupérer tous les jobs du recruteur
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, created_at, is_valid")
      .eq("recruiter_id", recruiterId);
    if (jobsError) throw jobsError;

    const jobIds = jobs?.map((j) => j.id) || [];

    // Récupérer toutes les candidatures liées aux jobs du recruteur
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(`id, full_name, email, cv_url, created_at, message, job_id, jobs(id, title)`)
      .in("job_id", jobIds) // SEULEMENT les jobs de ce recruteur
      .order("created_at", { ascending: false });
    if (appsError) throw appsError;

    // Construire la liste des jobs avec le nombre de candidatures
    const jobsWithApps: JobWithApplications[] = jobs?.map((job) => ({
      id: job.id,
      title: job.title,
      created_at: job.created_at,
      application_count: applications?.filter((app) => app.job_id === job.id).length || 0,
      is_active: job.is_valid,
    })) || [];

    setStats({ totalJobs: jobs?.length || 0, totalApplications: applications?.length || 0 });

    // Préparer les dernières candidatures pour affichage
 const recentApps: Application[] = applications?.map(app => {
  // Cherche le job correspondant dans la liste des jobs du recruteur
  const job = jobs.find(j => j.id === app.job_id);
  return {
    ...app,
    jobs: job ? [{ id: job.id, title: job.title }] : null,
  };
}) || [];


    setRecentApplications(recentApps.slice(0, 5));
    setAllJobs(jobsWithApps);

  } catch (error: any) {
    Sentry.captureException(error);
    toast({ title: "Erreur", description: "Impossible de récupérer les données du tableau de bord", variant: "destructive" });
  }
};



  const handleViewApplications = async (jobId: string) => {
    try {
  const { data, error } = await supabase
  .from("applications")
  .select(`id, full_name, email, cv_url, created_at, message, jobs(title)`) // ← ajout de message
  .eq("job_id", jobId)
  .order("created_at", { ascending: false });

      if (error) throw error;
      setSelectedJobApplications(data || []);
      setShowApplicationsDialog(true);
    } catch (error: any) {
      Sentry.captureException(error);
      toast({ title: "Erreur", description: "Impossible de charger les candidatures", variant: "destructive" });
    }
  };

const openCv = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from("cv_uploads")
      .createSignedUrl(filePath, 60); // 60 secondes de validité

    if (error || !data?.signedUrl) throw error || new Error("Impossible de générer le lien");

    // ouvre le CV dans un nouvel onglet
    window.open(data.signedUrl, "_blank");
  } catch (error: any) {
    console.error(error);
    toast({ title: "Erreur", description: "Impossible d'ouvrir le CV", variant: "destructive" });
  }
};


  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
      setAllJobs((prev) => prev.filter((job) => job.id !== id));
      setStats((prev) => ({ ...prev, totalJobs: prev.totalJobs - 1 }));
      toast({ title: "Offre supprimée", description: "L'offre d'emploi a été supprimée avec succès." });
    } catch (error: any) {
      Sentry.captureException(error);
      toast({ title: "Erreur", description: "Impossible de supprimer l'offre", variant: "destructive" });
    }
  };

const deleteProfilRecruiter = async () => {
  try {
    const res = await fetch("/api/delete-recruiter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error);

    toast({
      title: "Compte supprimé",
      description: "Votre compte recruteur a été supprimé définitivement.",
    });

    navigate.push("/");

  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.message,
      variant: "destructive",
    });
  }
};


  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    await supabase
      .from("applications")
      .update({ status: confirmAction.type === "accept" ? "acceptee" : "declinee" })
      .eq("id", confirmAction.id);
    if (confirmAction.type === "accept") toast({ title: "Candidature acceptée", description: "Le statut a été mis à jour." });
    setConfirmAction(null);
  };

  if (authLoading || loading) {
    return (
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </main>
        <Footer />
      </div>
    );
  }


  if (recruiterStatus === "pending") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center border-gray-200 shadow-md">
            <CardHeader>
              <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <CardTitle className="text-2xl font-semibold">Demande en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Votre demande de recruteur est en cours de validation. Vous recevrez une notification une fois approuvée.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (recruiterStatus === "rejected") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-red-600">Demande refusée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Votre demande de recruteur a été refusée. Contactez l'administration pour plus d'informations.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
  <div className="min-h-screen flex flex-col bg-gray-50">

    {/* === DIALOG: MODIFIER LE LOGO === */}
<Dialog open={showLogoDialog} onOpenChange={setShowLogoDialog}>
  <DialogContent className="bg-white max-w-md rounded-xl">


    {/* === AFFICHAGE DU LOGO ACTUEL === */}
    {logoUrl && (
      <div className="w-full flex justify-center mb-4">
        <img
          src={logoUrl}
          alt="Logo actuel"
          className="h-24 w-24 object-contain rounded-md"
        />
      </div>
    )}


    <div className="flex justify-end mt-6">
      <Button
        variant="outline"
        onClick={() => setShowLogoDialog(false)}
        className="text-gray-700 border-gray-300 hover:bg-gray-200"
      >
        Annuler
      </Button>
    </div>
  </DialogContent>
</Dialog>


    {/* === FIN DU DIALOG === */}

    <Header />

    {/* Main Dashboard */}
    <main className="flex-1 container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4d307cff] mb-2">Dashboard Recruteur</h1>
          <p className="text-gray-500 mb-1">Gérez vos offres et suivez vos candidatures</p>
          <p className="text-gray-600 font-medium">{companyName || "Chargement de l'entreprise..."}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/cvTech" className="w-full sm:w-auto">
            <Button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              <ImageIcon className="h-5 w-5" /> Cv Public
            </Button>
          </Link>

          <Button 
            onClick={deleteProfilRecruiter} 
            className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-red-500 rounded-lg text-red-500 hover:bg-red-100 transition sm:w-auto"
          >
            <Trash2 className="h-5 w-5" /> Supprimer mon profil
          </Button>

     
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="border border-gray-200 flex flex-col items-center shadow-sm hover:shadow-md transition">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total d'offres</CardTitle>
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200  flex flex-col items-center shadow-sm hover:shadow-md transition">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Candidatures reçues</CardTitle>
            <Users className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Applications & Jobs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dernières candidatures */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">Dernières candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune candidature pour le moment</p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 transition">
                    <div>
                      <p className="font-medium text-gray-800">{app.full_name}</p>
                 <p className="text-sm text-gray-500">{app.jobs?.[0]?.title || "Titre indisponible"}</p>

                      
                    </div>
                    <p className="text-sm text-gray-400">{new Date(app.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toutes mes offres */}
       <CardContent className="p-3 bg-white border border-gray-200 rounded-lg">
  {allJobs.length === 0 ? (
    <p className="text-gray-500 text-center py-6 text-sm">
      Aucune offre publiée
    </p>
  ) : (
<Table className="w-full table-fixed text-sm [&_tr]:border-b-0">

    <TableHeader className="border-b border-gray-300">

        <TableRow className="">
          <TableHead className="w-[40%] py-2 px-2">
            Titre
          </TableHead>
          <TableHead className="w-[20%] py-2 px-2">
            Date
          </TableHead>
          <TableHead className="w-[10%] py-2 px-2 text-center">
            CV
          </TableHead>
          <TableHead className="w-[30%] py-2 px-2">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {allJobs.map((job, idx) => (
          <TableRow
            key={job.id}
            className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
          >
            {/* Titre */}
            <TableCell className="px-2 py-2 text-gray-800 font-medium break-words leading-tight">
              {job.title}
            </TableCell>

            {/* Date */}
            <TableCell className="px-2 py-2 text-gray-600 whitespace-nowrap">
              {new Date(job.created_at).toLocaleDateString("fr-FR")}
            </TableCell>

            {/* Candidatures */}
            <TableCell className="px-2 py-2 text-center text-gray-600">
              {job.application_count}
            </TableCell>

            {/* Actions */}
            <TableCell className="px-2 py-2">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewApplications(job.id)}
                  className="h-8 px-3 text-xs border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Voir
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteJob(job.id)}
                  className="h-8 px-4 text-xs border border-gray-300 text-red-600 hover:bg-red-50"
                >
                  Suppr.
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}
</CardContent>



        {/* Dialog Candidatures */}
        <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
          <DialogContent className="max-w-2xl w-full bg-gray-100 rounded-xl shadow-lg p-6 overflow-y-auto max-h-[80vh] border border-gray-300">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Candidatures pour le poste
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Liste des candidats et leurs CV
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              {selectedJobApplications.length === 0 ? (
                <p className="text-gray-700 text-center py-6">
                  Aucune candidature pour ce poste
                </p>
              ) : (
                <ul className="space-y-2">
      {selectedJobApplications.map((app) => (
  <li
    key={app.id}
    className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition flex flex-col gap-2"
  >
    <div>
      <p className="font-medium text-gray-900">{app.full_name}</p>
      <p className="text-sm text-gray-600">{app.email}</p>
    </div>

    {app.message && (
      <p className="text-gray-700 text-sm">{app.message}</p>
    )}

    <Button
      size="sm"
      onClick={() => openCv(app.cv_url)}
      className="ml-0 bg-indigo-600 text-white hover:bg-indigo-700 border-none"
    >
      Voir le CV
    </Button>
  </li>
))}

                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowApplicationsDialog(false)}
                className="border-gray-400 text-gray-700 hover:bg-gray-200"
              >
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>

    <Footer />
  </div>
  );
}


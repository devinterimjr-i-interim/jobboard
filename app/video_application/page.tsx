"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { Footer } from "@/components/Footer";

interface VideoApplication {
  id: number;
  status: string;
  created_at: string;
  cv_url: string | null;
  message: string | null;
  full_name: string | null;
  email: string | null;
  video_job?: {
    title: string;
    location: string;
    contract_type: string;
  };
}

export default function AdminVideoApplications() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<VideoApplication[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // ✅ pour ne rien afficher tant que non vérifié

  /* 🔒 ADMIN ONLY */
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || data?.role !== "admin") {
          toast({
            title: "Accès refusé",
            description: "Cette page est réservée aux administrateurs",
            variant: "destructive",
          });
          router.push("/"); // redirection immédiate
          return;
        }

        setIsVerified(true); // utilisateur admin => on peut afficher la page
      } catch (err) {
        Sentry.captureException(err);
        router.push("/");
      }
    };

    if (!authLoading) {
      if (!user) router.push("/auth");
      else checkAdmin();
    }
  }, [user, authLoading, router, toast]);

  /* 🔎 Fetch candidatures vidéo */
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("applicationvideo")
        .select(`
          id,
          full_name,
          email,
          status,
          created_at,
          cv_url,
          message,
          video_job:videojob_id (
            title,
            location,
            contract_type
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        video_job: item.video_job?.[0] || null,
      }));

      setApplications(formattedData);
    } catch (error: any) {
      console.error(error);
      Sentry.captureException(error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les candidatures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerified) fetchApplications(); // fetch uniquement si admin vérifié
  }, [isVerified]);

  /* 🔁 Changer le statut via API ADMIN */
  const handleStatusChange = async (
    id: number,
    newStatus: "acceptee" | "declinee"
  ) => {
    try {
      setSubmitting(true);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch("/api/admin/video-application/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "Succès",
        description:
          newStatus === "acceptee"
            ? "Candidature acceptée"
            : "Candidature refusée",
      });

      fetchApplications();
    } catch (error: any) {
      console.error(error);
      Sentry.captureException(error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* 📄 Ouvrir le CV */
  const openCv = async (path: string | null) => {
    if (!path)
      return toast({ title: "Aucun CV disponible", variant: "destructive" });

    try {
      const { data, error } = await supabase.storage
        .from("cv_uploads")
        .createSignedUrl(path, 60);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le CV",
        variant: "destructive",
      });
    }
  };

  const getBadge = (status: string) => {
    switch (status) {
      case "en_attente":
        return (
          <Badge className="bg-orange-500/10 text-orange-500">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "consultée":
        return (
          <Badge className="bg-blue-500/10 text-blue-500">
            <Clock className="w-3 h-3 mr-1" />
            Consultée
          </Badge>
        );
      case "acceptee":
        return (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Acceptée
          </Badge>
        );
      case "declinee":
        return (
          <Badge className="bg-red-500/10 text-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Déclinée
          </Badge>
        );
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  // ✅ Ne rien afficher tant que non vérifié
  if (!isVerified) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6]">
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-10">
          Gestion des candidatures vidéo
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#4d307cff]" />
          </div>
        ) : applications.length === 0 ? (
          <p className="text-gray-500 text-center">
            Aucune candidature vidéo pour le moment.
          </p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white border rounded-lg p-5 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <h2 className="font-semibold">
                    {app.video_job?.title ?? "Titre introuvable"}
                  </h2>
                  {getBadge(app.status)}
                </div>

                <p>
                  <strong>Candidat :</strong> {app.full_name ?? "—"}
                </p>
                <p>
                  <strong>Email :</strong> {app.email ?? "—"}
                </p>
                <p>
                  <strong>Message :</strong> {app.message ?? "—"}
                </p>
                <p>
                  <strong>Lieu :</strong> {app.video_job?.location ?? "—"}
                </p>

                {app.cv_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openCv(app.cv_url)}
                    className="mt-2 text-[#4d307cff]"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir le CV
                  </Button>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    disabled={submitting || app.status === "acceptee"}
                    onClick={() => handleStatusChange(app.id, "acceptee")}
                    className="flex-1 bg-green-100 text-green-700"
                  >
                    Accepter
                  </Button>
                  <Button
                    disabled={submitting || app.status === "declinee"}
                    onClick={() => handleStatusChange(app.id, "declinee")}
                    className="flex-1 bg-red-100 text-red-700"
                  >
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

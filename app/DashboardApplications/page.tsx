"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, X, Inbox, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import * as Sentry from "@sentry/nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Application {
  id: string;
  full_name: string;
  email: string;
  message?: string;
  cv_url: string;
  created_at: string;
  status: string;
  rejection_message?: string;
  jobs: {
    title: string;
    sector: string;
  };
}

export default function DashboardApplications() {
const { toast } = useToast();
const [applications, setApplications] = useState<Application[]>([]);
const [loading, setLoading] = useState(true);

// Pour la modale de refus
const [selected, setSelected] = useState<Application | null>(null);
const [showRejectDialog, setShowRejectDialog] = useState(false);
const [rejectMessage, setRejectMessage] = useState("");
const [rejectingId, setRejectingId] = useState<string | null>(null);

// Fetch des candidatures au montage
useEffect(() => {
  fetchApplications();
}, []);

// Récupère les candidatures depuis Supabase
const fetchApplications = async () => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`*, jobs(title, sector)`) // jointure pour récupérer les infos du job
      .order("created_at", { ascending: false });

    if (error) throw error;
    setApplications(data || []);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching applications:", error);
    }
    Sentry.captureException(error);
  } finally {
    setLoading(false);
  }
};
async function openCv(idpath) {
  const filePath = idpath; // EXACTEMENT ce qui est stocké en BDD

  const { data, error } = await supabase.storage
    .from('cv_uploads') 
    .createSignedUrl(filePath, 60); // URL valable 60 sec

  if (error) {
    console.error(error);
    return alert("Impossible d’ouvrir le document");
  }

  window.open(data.signedUrl);
}

// Ouvre la modale de refus
const handleReject = (id: string) => {
  setRejectingId(id);
  setRejectMessage("");
  setShowRejectDialog(true);
};

// Confirme le refus et met à jour la candidature
const confirmReject = async () => {
  if (!rejectingId) return;

  try {
    const { error } = await supabase
      .from("applications")
      .update({
        status: "declinee",
        rejection_message: rejectMessage || null,
      })
      .eq("id", rejectingId);

    if (error) throw error;

    toast({
      title: "Candidature déclinée",
      description: "Le candidat a été notifié du refus.",
    });

    // Réinitialisation des états et refresh des données
    setShowRejectDialog(false);
    setRejectingId(null);
    setRejectMessage("");
    fetchApplications();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error rejecting application:", error);
    }
    Sentry.captureException(error);

    toast({
      title: "Erreur",
      description: "Impossible de décliner la candidature",
      variant: "destructive",
    });
  }
};


  if (loading) {
    return (
      
      <div className="text-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent mx-auto mb-4"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="justify-center text-center py-12 mb-6 flex flex-col items-center">
        <p className="text-gray-500">Aucune candidature reçue</p>
      </div>
    );
  }

  return (
  <div className="mb-6 pt-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
  {/* Header */}
  
 
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 rounded-lg bg-primary/10">
      <Inbox className="h-6 w-6 text-primary" />
    </div>
    <h2 className="text-2xl font-semibold text-gray-900">Candidatures reçues</h2>
  </div>

  {/* Conteneur responsive */}
  <div className="space-y-4 sm:space-y-0 overflow-x-auto">
    {applications.map((app) => (
      <div
        key={app.id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 sm:flex sm:items-center sm:gap-4 p-4 sm:p-3 transition-all hover:shadow-md"
      >
        {/* Mobile card version */}
        <div className="sm:hidden space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">{app.full_name}</h3>
            <span className="text-gray-500 text-sm">
              {format(new Date(app.created_at), "dd MMM yyyy", { locale: fr })}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge className="bg-primary/10 text-primary">{app.jobs.sector}</Badge>
            <Badge
              className={`${
                app.status === "en_attente" ? "bg-orange-100 text-orange-500" :
                app.status === "acceptee" ? "bg-green-100 text-green-500" :
                "bg-red-100 text-red-500"
              }`}
            >
              {app.status === "en_attente" ? "En attente" : app.status === "acceptee" ? "Acceptée" : "Déclinée"}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Button variant="ghost" className="w-full" onClick={() => setSelected(app)}>
              <Eye className="h-4 w-4 mr-2" /> Voir
            </Button>
            {app.status === "en_attente" && (
              <Button variant="ghost" className="w-full text-destructive" onClick={() => handleReject(app.id)}>
                <XCircle className="h-4 w-4 mr-2" /> Décliner
              </Button>
            )}
          </div>
        </div>

        {/* Desktop table version */}
        <div className="hidden sm:flex w-full items-center gap-4">
          <div className="flex-1 font-medium text-gray-800">{app.full_name}</div>
          <div className="flex-1">{app.jobs.title}</div>
          <div className="flex-1">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {app.jobs.sector}
            </Badge>
          </div>
          <div className="flex-1">
            {app.status === "en_attente" && <Badge className="bg-orange-100 text-orange-500">En attente</Badge>}
            {app.status === "acceptee" && <Badge className="bg-green-100 text-green-500">Acceptée</Badge>}
            {app.status === "declinee" && <Badge className="bg-red-100 text-red-500">Déclinée</Badge>}
          </div>
          <div className="flex-1 text-gray-500">
            {format(new Date(app.created_at), "dd MMM yyyy", { locale: fr })}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setSelected(app)}>
              <Eye className="h-4 w-4" /> Voir
            </Button>
            {app.status === "en_attente" && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleReject(app.id)}>
                <XCircle className="h-4 w-4" /> Décliner
              </Button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Modal détails candidature */}
  <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
    <DialogContent className="max-w-lg w-full sm:w-[90%] bg-white rounded-xl p-6 shadow-lg">
      {selected && (
        <>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">{selected.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Poste :</strong> {selected.jobs.title}</p>
            <p><strong>Secteur :</strong> {selected.jobs.sector}</p>
            <p>
              <strong>Email :</strong>{" "}
              <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                {selected.email}
              </a>
            </p>
            <p>
              <strong>Date :</strong>{" "}
              {format(new Date(selected.created_at), "dd MMMM yyyy", { locale: fr })}
            </p>
          </div>

          {selected.message && (
            <div className="mt-4 bg-gray-100 rounded-md p-3 whitespace-pre-line text-sm">
              {selected.message}
            </div>
          )}

         <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
  <Button
    variant="outline"
onClick={() => openCv(selected.cv_url)}

    className="w-full sm:w-auto gap-2 border border-gray-300 hover:border-gray-400 rounded-md">
    <ExternalLink className="h-4 w-4" /> Voir le CV
  </Button>
  
  <Button
    className="bg-[#4d307cff] hover:bg-[#3d2063] text-white gap-2 w-full sm:w-auto border border-[#4d307cff] rounded-md"
    onClick={() => setSelected(null)}
  >
    <X className="h-4 w-4" /> Fermer
  </Button>
</div>

        </>
      )}
    </DialogContent>
  </Dialog>
</div>

  );
}

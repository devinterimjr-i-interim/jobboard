import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, Calendar, Eye, X, Inbox, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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

export const DashboardApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            title,
            sector
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      console.error("Error fetching applications:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
    setRejectMessage("");
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectingId) return;

    try {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "declinee",
          rejection_message: rejectMessage || null
        })
        .eq("id", rejectingId);

      if (error) throw error;

      toast({
        title: "Candidature déclinée",
        description: "Le candidat a été notifié du refus.",
      });

      setShowRejectDialog(false);
      setRejectingId(null);
      setRejectMessage("");
      fetchApplications();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      console.error("Error rejecting application:", error);
      }
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="justify-center text-center py-12 mb-6 flex-col pt-10">
        <p className="text-muted-foreground">Aucune candidature reçue</p>
      </div>
    );
  }

  return (
  <div className="mb-6 flex-col pt-10 flex">
  <div className="flex items-center gap-3 mb-6">
    <div className="m-[6px] p-2 rounded-lg bg-primary/10">
      <Inbox className="h-6 w-6 text-primary" />
    </div>
    <h2 className="text-2xl font-semibold">Candidatures reçues</h2>
  </div>

  <div className="rounded-lg border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Poste</TableHead>
          <TableHead>Secteur</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{app.full_name}</TableCell>
            <TableCell>{app.jobs.title}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {app.jobs.sector}
              </Badge>
            </TableCell>
            <TableCell>
              {app.status === "en_attente" && (
                <Badge
                  variant="secondary"
                  className="bg-orange-500/10 text-orange-500"
                >
                  En attente
                </Badge>
              )}
              {app.status === "acceptee" && (
                <Badge className="bg-green-500/10 text-green-500">
                  Acceptée
                </Badge>
              )}
              {app.status === "declinee" && (
                <Badge
                  variant="destructive"
                  className="bg-red-500/10 text-red-500"
                >
                  Déclinée
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(app.created_at), "dd MMMM yyyy", { locale: fr })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(app)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir
                </Button>
                {app.status === "en_attente" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReject(app.id)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Décliner
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>

  {/* Modal pour afficher les détails */}
  <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
    <DialogContent className="max-w-lg">
      {selected && (
        <>
          <DialogHeader>
            <DialogTitle>{selected.full_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Poste :</strong> {selected.jobs.title}
            </p>
            <p>
              <strong>Secteur :</strong> {selected.jobs.sector}
            </p>
            <p>
              <strong>Email :</strong>{" "}
              <a
                href={`mailto:${selected.email}`}
                className="text-primary hover:underline"
              >
                {selected.email}
              </a>
            </p>
            <p>
              <strong>Date :</strong>{" "}
              {format(new Date(selected.created_at), "dd MMMM yyyy", {
                locale: fr,
              })}
            </p>
          </div>

          {selected.message && (
            <div className="mt-4 bg-muted rounded-md p-3 whitespace-pre-line text-sm">
              {selected.message}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(selected.cv_url, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir le CV
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              <X className="mr-1 h-4 w-4" />
              Fermer
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>

  {/* Dialog pour décliner une candidature */}
  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Décliner la candidature</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Vous pouvez ajouter un message expliquant le motif du refus
          (optionnel).
        </p>
        <Textarea
          placeholder="Motif du refus (optionnel)..."
          value={rejectMessage}
          onChange={(e) => setRejectMessage(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={confirmReject}>
            Confirmer le refus
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</div>

  );
};

"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApplicationFormProps {
  jobId: string;
  jobTitle?: string; // ← ajoute cette ligne
}

export const ApplicationForm = ({ jobId, jobTitle }: ApplicationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useRouter();

  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    message: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const MAX_MESSAGE_LENGTH = 1000; // Limite message

  const sanitizeInput = (input: string) => input.trim().replace(/[<>]/g, "");

  // Vérifier candidature existante
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) {
        setCheckingApplication(false);
        return;
      }
      try {
        const { data: existingApplications, error } = await supabase
          .from("applications")
          .select()
          .eq("job_id", jobId)
          .eq("user_id", user.id);
        if (error) throw error;
        if ((existingApplications?.length ?? 0) > 0) setHasApplied(true);
      } catch (error) {
        Sentry.captureException(error);
      } finally {
        setCheckingApplication(false);
      }
    };
    checkExistingApplication();
  }, [user, jobId]);

  // Récupérer profil
useEffect(() => {
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle(); // ← remplace single() par maybeSingle()

      if (error) throw error;

      if (!data) {
        console.warn("Profil introuvable pour l'utilisateur", user.id);
        return;
      }

      setFormData({
        fullName: data.full_name || "",
        email: data.email || "",
        message: "",
      });
    } catch (err) {
      console.error("Erreur récupération profil:", err);
      Sentry.captureException(err);
    }
  };

  fetchProfile();
}, [user]);


  // Récupérer job
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();
        if (error) throw error;
        setJob(data);
      } catch (error) {
        Sentry.captureException(error);
      }
    };
    fetchJob();
  }, [jobId]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !job || !cvFile) return;
  setLoading(true);

  try {
    const form = new FormData();
    form.append("jobId", jobId);
    form.append("message", sanitizeInput(formData.message));
    form.append("cv", cvFile);

    // 🔒 Auth Bearer token depuis Supabase client
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) throw new Error("Utilisateur non connecté");

    const res = await fetch("/api/applications", {
      method: "POST",
      body: form,
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Erreur lors de l'envoi");

    toast({ title: "Candidature envoyée", description: "Votre candidature a été envoyée avec succès !" });
    navigate.push("/offres");
  } catch (error: any) {
    toast({ title: "Erreur", description: error.message || "Une erreur est survenue", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  // Affichage conditionnel
  if (checkingApplication) return (
    <Card className="border border-gray-200"><CardContent className="py-8"><p className="text-center text-muted-foreground">Vérification en cours...</p></CardContent></Card>
  );
  if (hasApplied) return (
    <Card className="border border-gray-200">
      <CardHeader><CardTitle>Postuler à : {job?.title}</CardTitle></CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Vous avez déjà postulé à cette offre d'emploi.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate.push("/offres")} variant="outline" className="w-full mt-4">Retour aux offres</Button>
      </CardContent>
    </Card>
  );

  return (
    <Card className="border border-gray-200 rounded-xl shadow-md bg-white max-w-xl mx-auto">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">{job?.title}</CardTitle>
        {job && (<div className="mt-2 flex flex-wrap gap-4 text-gray-600 text-sm"><span className="bg-gray-100 px-2 py-1 rounded">{job.type}</span><span className="bg-gray-100 px-2 py-1 rounded">{job.location}</span></div>)}
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" name="website" style={{ display: "none" }} />
          <div>
            <Label htmlFor="message" className="text-gray-700 font-medium">Message de motivation</Label>
            <Textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(e) => {
                if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                  setFormData({ ...formData, message: e.target.value });
                }
              }}
              placeholder={`Présentez-vous et expliquez votre motivation (max ${MAX_MESSAGE_LENGTH} caractères)...`}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.message.length}/{MAX_MESSAGE_LENGTH} caractères</p>
          </div>

          <div>
            <Label htmlFor="cv" className="text-gray-700 font-medium">CV (PDF/DOC/DOCX) *</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input id="cv" type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="cursor-pointer border border-gray-300 rounded-md p-2 w-full" />
              <Upload className="h-6 w-6 text-gray-500" />
            </div>
            {cvFile && (<p className="text-sm text-gray-500 mt-1">Fichier sélectionné : {cvFile.name}</p>)}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#5B3CC4] hover:bg-[#4A2FB0] text-white font-semibold py-3 rounded-md transition-colors duration-200">
            {loading ? "Envoi en cours..." : "Envoyer ma candidature"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApplicationForm;

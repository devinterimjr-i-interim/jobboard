"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const FormVideo = () => {
  const router = useRouter();
  const params = useParams();
  const videoId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [job, setJob] = useState<any>(null);

  // Limite de caractères pour le message
  const MAX_MESSAGE_LENGTH = 1000;

  // Charger user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  // Charger job
  useEffect(() => {
    if (!videoId) return;
    supabase
      .from("video_job")
      .select("*")
      .eq("id", videoId)
      .single()
      .then(({ data }) => {
        if (data) setJob(data);
      });
  }, [videoId]);

  // Vérifier candidature existante
  useEffect(() => {
    if (!user) {
      setCheckingApplication(false);
      return;
    }

    supabase
      .from("applicationvideo")
      .select()
      .eq("videojob_id", videoId)
      .eq("users_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) setHasApplied(true);
        setCheckingApplication(false);
      });
  }, [user, videoId]);

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;

    setLoading(true);

    try {
      if (!cvFile) {
        alert("Veuillez télécharger votre CV");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(cvFile.type)) {
        alert("Format invalide : PDF/DOC/DOCX uniquement");
        return;
      }

      if (cvFile.size > 10 * 1024 * 1024) {
        alert("Fichier trop volumineux (max 10MB)");
        return;
      }

      // Upload CV via API
      const { data: datasession } = await supabase.auth.getSession();
      const token = datasession.session?.access_token;
      if (!token) throw new Error("Utilisateur non authentifié");

      const uploadFormData = new FormData();
      uploadFormData.append("file", cvFile);
      uploadFormData.append("website", "");

      const res = await fetch("/api/user-cv-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      });
      const uploadResult = await res.json();
      if (!res.ok) throw new Error(uploadResult.error || "Erreur upload CV");

      const cvPath = uploadResult.path;

      // Récupérer profil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;

      // INSERT candidature
      const { error: insertError } = await supabase.from("applicationvideo").insert([{
        videojob_id: videoId,
        users_id: user.id,
        full_name: profileData.full_name,
        email: profileData.email,
        message,
        cv_url: cvPath,
        status: "en_attente",
      }]);
      if (insertError) throw insertError;

      router.push("/offres");
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      alert("❌ Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">

          {/* Déjà postulé */}
          {checkingApplication ? (
            <Card className="border border-gray-200">
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Vérification en cours...</p>
              </CardContent>
            </Card>
          ) : hasApplied ? (
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Postuler à : {job?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Vous avez déjà postulé à cette offre vidéo.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => router.push("/offres")}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Retour aux offres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-200 rounded-xl shadow-md bg-white max-w-xl mx-auto">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">{job?.title}</CardTitle>
                {job && (
                  <div className="mt-2 flex flex-wrap gap-4 text-gray-600 text-sm">
                    <span className="bg-gray-100 px-2 py-1 rounded">{job.type}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{job.location}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="px-6 pb-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">Message de motivation</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={message}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                          setMessage(e.target.value);
                        }
                      }}
                      placeholder={`Présentez-vous et expliquez votre motivation (max ${MAX_MESSAGE_LENGTH} caractères)...`}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
                    />
                    {/* Compteur de caractères */}
                    <p className="text-sm text-gray-500 mt-1">
                      {message.length}/{MAX_MESSAGE_LENGTH} caractères
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="cv" className="text-gray-700 font-medium">CV (PDF/DOC/DOCX) *</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        className="cursor-pointer border border-gray-300 rounded-md p-2 w-full"
                      />
                      <Upload className="h-6 w-6 text-gray-500" />
                    </div>
                    {cvFile && (
                      <p className="text-sm text-gray-500 mt-1">Fichier sélectionné : {cvFile.name}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#5B3CC4] hover:bg-[#4A2FB0] text-white font-semibold py-3 rounded-md transition-colors duration-200"
                  >
                    {loading ? "Envoi en cours..." : "Envoyer ma candidature"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FormVideo;

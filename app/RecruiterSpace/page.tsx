"use client";
import { v4 as uuidv4 } from "uuid";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { supabase } from "@/lib/supabaseClient"; 
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function RecruiterAccess() {
  interface Profile {
    id: string;
    full_name: string;
    email?: string;
  }


  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [profile, setProfile] = useState<Profile[]>([]);

const isProfessionalEmail = (email: string) => {
  if (!email) return false;

  // Trim et lowercase pour éviter les contournements
  email = email.trim().toLowerCase();

  // Vérifie la structure de base
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Liste des domaines gratuits connus
  const freeDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "live.com", "aol.com", "icloud.com", "protonmail.com",
    "mail.com", "yandex.com"
  ];

  const domain = email.split("@")[1];

  // Bloque les domaines gratuits
  if (freeDomains.includes(domain)) return false;

  // Vérifie qu'il y a au moins un point dans le domaine
  if (!domain.includes(".")) return false;

  return true;
};


  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    sector: "",
    website: "",
    description: "",
    size: "",
    location: "",
    logo: null as File | null,
    email_pro: "",
    accepted_cgu: false,
  });

  const sanitizeInput = (input?: string) =>
    (input ?? "").trim().replace(/[<>]/g, "");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from("profiles").select().eq('id', user?.id);
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      contact_name: profile[0]?.full_name || ""
    }));
  }, [profile]);

  // 🔒 Redirection si non connecté
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [user, authLoading, router]);

  // 🔎 Vérifie le statut recruteur
  useEffect(() => {
    if (user) checkRecruiterStatus();
  }, [user]);

  const checkRecruiterStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("recruiters")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setRecruiter(data);
    } catch (error: any) {
      Sentry.captureException(error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier votre statut",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage("");
  setSubmitting(true);

  try {
      if (!isProfessionalEmail(formData.email_pro)) {
      setErrorMessage("Veuillez saisir un email professionnel valide.");
      setSubmitting(false);
      return;
    }
    const cleanedData = {
      company_name: sanitizeInput(formData.company_name),
      contact_name: sanitizeInput(formData.contact_name),
      phone: sanitizeInput(formData.phone),
      sector: sanitizeInput(formData.sector),
      website: sanitizeInput(formData.website),
      description: sanitizeInput(formData.description),
      size: sanitizeInput(formData.size),
      location: sanitizeInput(formData.location),
      email_pro: sanitizeInput(formData.email_pro),
    };

    if (!formData.logo) {
      setErrorMessage("Le logo est obligatoire.");
      setSubmitting(false);
      return;
    }

    // 🔹 Upload du logo
    const { data: datasession } = await supabase.auth.getSession();
    const token = datasession.session?.access_token;

    const apiForm = new FormData();
    apiForm.append("logo", formData.logo);
    apiForm.append("website", ""); // honeypot

    const res = await fetch("/api/recruiter-upload", {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: apiForm,
    });

    const uploadData = await res.json();
    if (!res.ok) {
      setErrorMessage(uploadData.error || "Erreur lors de l'upload du logo");
      setSubmitting(false);
      return;
    }

    const confirmationToken = uuidv4();

    // 🔹 Enregistrement dans Supabase
    const { error: insertError } = await supabase.from("recruiters").insert({
      user_id: user!.id,
      ...cleanedData,
      logo_url: uploadData.logoUrl,
      status: "pending",
      accepted_cgu: formData.accepted_cgu,
      confirmation_token: confirmationToken,
      is_confirmed: false,
    });

    if (insertError) throw insertError;

    // 🔹 Appel de l'API Mailjet pour envoyer le mail
    const mailRes = await fetch("/api/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanedData.email_pro, token: confirmationToken }),
    });

    const mailData = await mailRes.json();
    if (!mailRes.ok || !mailData.success) {
      setErrorMessage(mailData.error || "Impossible d'envoyer le mail de confirmation");
      setSubmitting(false);
      return;
    }

    toast({
      title: "Demande enregistrée",
      description: "Votre demande est enregistrée. Un mail de confirmation a été envoyé.",
    });

    checkRecruiterStatus();
  } catch (error: any) {
    Sentry.captureException(error);
    setErrorMessage(error.message || "Impossible d'envoyer votre demande");
  } finally {
    setSubmitting(false);
  }
};



  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4d307cff]" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-12 w-12 text-[#4d307cff]" />;
      case "rejected": return <XCircle className="h-12 w-12 text-red-500" />;
      default: return <Clock className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "approved": return {
        title: "Compte approuvé",
        description: "Votre compte recruteur a été approuvé. Vous pouvez maintenant publier des offres d'emploi ou accéder à votre tableau de bord.",
        action: (
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <Button onClick={() => router.push("/PostJob")} className="bg-[#4d307cff] text-white hover:bg-[#371f7a]">Publier une offre</Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => router.push("/RecruiterStatus")}>Accéder au dashboard</Button>
          </div>
        )
      };
      case "rejected": return {
        title: "Demande refusée",
        description: "Votre demande de compte recruteur a été refusée. Veuillez contacter l'administration pour plus d'informations.",
      };
      default: return {
        title: "Demande en attente",
        description: "Votre demande de compte recruteur est en cours de validation. Vous recevrez une notification dès qu'elle sera traitée.",
      };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {recruiter ? (
            <Card className="bg-white shadow-md rounded-xl border border-gray-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">{getStatusIcon(recruiter.status)}</div>
                <CardTitle className="text-2xl">{getStatusMessage(recruiter.status).title}</CardTitle>
                <CardDescription>{getStatusMessage(recruiter.status).description}</CardDescription>
              </CardHeader>
              {getStatusMessage(recruiter.status).action && (
                <CardContent className="text-center">
                  {getStatusMessage(recruiter.status).action}
                </CardContent>
              )}
            </Card>
          ) : (
            <Card className="bg-white shadow-md rounded-xl border border-gray-300 mt-6">
              <CardHeader>
                <CardTitle className="text-2xl">Espace Recruteur</CardTitle>
                <CardDescription>Inscrivez-vous pour publier vos offres d'emploi</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <Label>Nom de l'entreprise <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Ex: ACME Corp"
                      className="border border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Contact <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Ex: John Doe"
                      className="border border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Téléphone <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: +33 6 12 34 56 78"
                      className="border border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Email Pro <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.email_pro}
                      onChange={(e) => setFormData({ ...formData, email_pro: e.target.value })}
                      placeholder="Ex: contact@monentreprise.com"
                      className="border border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Secteur <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      placeholder="Ex: Informatique, Marketing, Santé"
                      className="border border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Description <span className="text-red-500">*</span></Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Présentez votre entreprise..."
                      className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-none"
                    />
                  </div>

                  <div>
                    <Label>Taille de l'entreprise <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="Ex: 50-100 employés"
                      className="border border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Localisation <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Paris, France"
                      className="border border-gray-300"
                    />
                  </div>

                  <div>
                    <Label>Logo <span className="text-red-500">*</span></Label>
                    <p className="text-xs text-gray-500 mt-1">Format accepté : PNG ou JPEG uniquement.</p>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                      className="border border-gray-300"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-gray-300 rounded mt-1"
                      checked={formData.accepted_cgu}
                      onChange={(e) => setFormData({ ...formData, accepted_cgu: e.target.checked })}
                      required
                    />
                    <input type="text" name="website" style={{ display: "none" }} autoComplete="off" />
                    <span className="text-sm">
                      J’accepte les{" "}
                      <Link href="/cgu" className="underline text-blue-600">
                        Conditions Générales d’Utilisation
                      </Link>
                    </span>
                  </div>

                  <Button type="submit" className="bg-[#4d307cff] text-white hover:bg-[#371f7a] mt-2" disabled={submitting}>
                    {submitting ? "Envoi..." : "Envoyer la demande"}
                  </Button>
  <p className="text-gray-500 text-sm mt-4 text-center">
      Un email de confirmation vous sera envoyé. Pensez à vérifier vos spams.
    </p>
                  {errorMessage && (
                    <p className="text-red-600 text-sm mb-2 text-center">{errorMessage}</p>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Briefcase } from "lucide-react";

interface Sector {
  id: string;
  name: string;
}

export default function PostJob() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isApprovedRecruiter, setIsApprovedRecruiter] = useState(false);
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sector, setSector] = useState<Sector[]>([]);
  const [tag, setTag] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    sector: "",
    location: "",
    type: "CDI",
    salary_range: "",
    description: "",
    requirements: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function sanitizeInput(input: string) {
    return input.replace(/[<>]/g, "").trim();
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }
    if (user) checkRecruiterStatus();
  }, [user, authLoading, router]);

  const checkRecruiterStatus = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("recruiters")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();
     
      if (error) throw error;

      if (data?.status === "approved") {
        setIsApprovedRecruiter(true);
        setRecruiterId(data.id);
      } else {
        setIsApprovedRecruiter(false);
      }
    } catch (error) {
      console.error(error);
      setIsApprovedRecruiter(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSector = async () => {
    try {
      const { data } = await supabase.from("sectors").select();
      setSector(data || []);
    } catch (error) {
      console.error("Erreur fetch sectors:", error);
    }
  };

  useEffect(() => {
    fetchSector();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;

    if (!recruiterId) return;

    if (!token) {
      toast({ title: "Token manquant", variant: "destructive" });
      return;
    }

    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = "Le titre du poste est obligatoire";
    if (!formData.sector.trim()) newErrors.sector = "Le secteur est obligatoire";
    if (!formData.location.trim()) newErrors.location = "La localisation est obligatoire";
    if (!formData.description.trim()) newErrors.description = "La description est obligatoire";
    if (!formData.salary_range.trim()) newErrors.salary_range = "La fourchette salariale est obligatoire";
    if (!formData.requirements.trim()) newErrors.requirements = "Les compétences requises sont obligatoires";
    if (!tag) newErrors.tag = "Vous devez sélectionner un secteur parmi les suggestions";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/post-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: sanitizeInput(formData.title),
          sector: sanitizeInput(formData.sector),
          location: sanitizeInput(formData.location),
          type: sanitizeInput(formData.type),
          salary_range: sanitizeInput(formData.salary_range),
          description: sanitizeInput(formData.description),
          requirements: sanitizeInput(formData.requirements),
          recruiter_id: recruiterId,
          sector_id: tag,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      toast({
        title: "Offre publiée avec succès !",
        description: "Votre offre d'emploi est maintenant en ligne.",
      });

      setFormData({
        title: "",
        sector: "",
        location: "",
        type: "CDI",
        salary_range: "",
        description: "",
        requirements: "",
      });
      setTag(null);
      setErrors({});
      router.push("/");

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la publication de l'offre.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {!isApprovedRecruiter ? (
          <div className="max-w-md mx-auto mt-16 text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
            <p className="text-lg">
              Votre compte recruteur doit être validé avant de publier une offre.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Publier une offre d'emploi</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">

              {/* Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">Titre du poste *</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Développeur Fullstack React/Node"
                  className="border border-gray-200"
                  maxLength={35}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Secteur */}
              <div>
                <label htmlFor="sector" className="block text-sm font-medium mb-2">Secteur d'activité *</label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Technologies de l'information"
                  className="border border-gray-200"
                />
                {errors.sector && <p className="text-red-600 text-sm mt-1">{errors.sector}</p>}
              </div>

              {/* Localisation */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">Localisation *</label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Paris, France"
                  className="border border-gray-200"
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Type de contrat */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2">Type de contrat *</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="border border-gray-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-white">
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Intérim">Intérim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fourchette salariale */}
              <div>
                <label htmlFor="salary_range" className="block text-sm font-medium mb-2">Fourchette salariale *</label>
                <Input
                  id="salary_range"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  placeholder="40k-50k€"
                  className="border border-gray-200"
                />
                {errors.salary_range && <p className="text-red-600 text-sm mt-1">{errors.salary_range}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">Description du poste *</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="border border-gray-200"
                  placeholder="Décrivez les missions principales..."
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Compétences */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium mb-2">Compétences requises *</label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  className="border border-gray-200"
                  placeholder="Ex: React, Node.js, SQL..."
                />
                {errors.requirements && <p className="text-red-600 text-sm mt-1">{errors.requirements}</p>}
              </div>

              {/* Tags / secteurs */}
              <div className="flex flex-wrap gap-2">
                {sector.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTag(s.id)}
                    aria-pressed={tag === s.id}
                    className={`border border-gray-200 rounded-lg p-2 flex items-center gap-1 hover:bg-gray-100 transition-colors ${tag === s.id ? "bg-gray-100" : ""}`}
                  >
                    <Briefcase className="w-3 h-3 text-gray-500" />
                    <span className="text-sm font-medium">{s.name}</span>
                  </button>
                ))}
                {errors.tag && <p className="text-red-600 text-sm mt-1 w-full">{errors.tag}</p>}
              </div>

              {/* Submit */}
              <Button type="submit" disabled={submitting} className="w-full bg-[#4d307cff] text-white">
                {submitting ? "Publication en cours..." : "Publier l'offre"}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Toutes les offres sont vérifiées par notre équipe avant publication. Cette vérification peut prendre entre 24 et 72 heures. Merci de vous assurer que votre offre est complète et conforme. Toute offre frauduleuse sera supprimée après vérification.
              </p>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  sector: string;
  location: string;
  type: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  is_valid: boolean;
}

interface JobFormProps {
  job?: Job | null;
  onSuccess: () => void;
}

export const JobForm = ({ job, onSuccess }: JobFormProps) => {
  const { toast } = useToast();
    const router = useRouter();
  const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
  title: job?.title || "",
  sector: job?.sector || "",
  location: job?.location || "",
  type: job?.type || "",
  description: job?.description || "",
  requirements: job?.requirements || "",
  salary_range: job?.salary_range || "",
  is_valid: job?.is_valid ?? false,
});

  // sanitize function
  const sanitizeInput = (input: string) => input.trim().replace(/[<>]/g, "");
  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1️⃣ Sanitisation de tous les champs texte avant envoi
    const sanitizedData = {
      title: sanitizeInput(formData.title),
      sector: sanitizeInput(formData.sector),
      location: sanitizeInput(formData.location),
      type: sanitizeInput(formData.type),
      description: sanitizeInput(formData.description),
      requirements: sanitizeInput(formData.requirements || ""),
      salary_range: sanitizeInput(formData.salary_range || ""),
      is_valid: formData.is_valid, // booléen, pas besoin de sanitisation
    };

    if (job) {
      const { error } = await supabase
        .from("jobs")
        .update(sanitizedData)
        .eq("id", job.id);

      if (error) throw error;
      toast({ title: "Offre modifiée" });
    } else {
      const { error } = await supabase
        .from("jobs")
        .insert(sanitizedData);

      if (error) throw error;
      toast({ title: "Offre créée" });
    }

    onSuccess();
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  return (
<div className="p-6 max-w-2xl mx-auto bg-white border border-gray-200 rounded-none sm:rounded-2xl shadow-sm mt-20 mb-[20px]">


  <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900 text-center">
    {job ? "Modifier l'offre" : "Nouvelle offre"}
  </h1>

  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Titre de l'offre */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Titre de l'offre *</label>
      <Input className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        placeholder="Titre de l'offre"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
    </div>

    {/* Secteur */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Secteur *</label>
      <Input
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        placeholder="Informatique, Marketing..."
        value={formData.sector}
        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
        required
      />
    </div>

    {/* Localisation */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Localisation *</label>
      <Input
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        placeholder="Ex : Paris"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        required
      />
    </div>

    {/* Type de contrat */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
      <Input
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        placeholder="CDI, CDD..."
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        required
      />
    </div>

    {/* Salaire */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Salaire annuel</label>
      <Input
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        placeholder="Ex : 35k"
        value={formData.salary_range}
        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
      />
    </div>

    {/* Description */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Description *</label>
      <Textarea
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        placeholder="Décrivez le poste..."
        rows={4}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />
    </div>

    {/* Profil recherché */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Profil recherché</label>
      <Textarea
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        placeholder="Ex : compétences, expériences..."
        rows={4}
        value={formData.requirements}
        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
      />
    </div>
<div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
  <div>
    <Label className="text-sm font-medium text-gray-700">
      Valider l’offre
    </Label>
    <p className="text-xs text-gray-500">
      Si activé, l’offre sera visible sur le site
    </p>
  </div>

<Switch
  checked={formData.is_valid}
  onCheckedChange={(value) =>
    setFormData({ ...formData, is_valid: value })
  }
  className={`w-12 h-6 rounded-full transition-colors ${
    formData.is_valid ? "bg-green-500" : "bg-gray-300"
  }`}
>
  <span
    className={`block w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
      formData.is_valid ? "translate-x-6" : "translate-x-0"
    }`}
  />
</Switch>


</div>

    {/* Bouton */}
    <Button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-lg bg-[#4d307cff] text-white font-semibold hover:bg-[#3e2666] transition-colors duration-300 shadow-md"
    >
      {loading ? "Enregistrement..." : job ? "Modifier l'offre" : "Créer l'offre"}
    </Button>
  </form>
</div>

  );
};

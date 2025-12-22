"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function EditVideoJobPage() {
  const [video, setVideo] = useState({
    title: "",
    video_url: "",
    location: "",
    contract_type: "",
    salary: "",
  });

  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function fetchJobOffer() {
    const { data } = await supabase
      .from("video_job")
      .select()
      .eq("id", params.id)
      .single();

    if (data) setVideo(data);
  }

  useEffect(() => {
    fetchJobOffer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from("video_job")
      .update({
        title: video.title,
        video_url: video.video_url,
        location: video.location,
        contract_type: video.contract_type,
        salary: video.salary,
      })
      .eq("id", params.id);

    setSubmitting(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'offre.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Offre vidéo mise à jour avec succès !",
      });
      router.push("/DashboardJobs");
    }
  };

  return (
<div className="p-4 sm:p-6 max-w-full sm:max-w-2xl mx-auto bg-white border-x border-gray-200 rounded-2xl mt-10 sm:mt-20">
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-900 text-center">
    Modifier l'offre vidéo
  </h1>

  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
    {/* TITRE */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Titre de l'offre</label>
      <Input
        placeholder="Titre de l'offre"
        value={video.title}
        onChange={(e) => setVideo({ ...video, title: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        required
      />
    </div>

    {/* URL VIDEO */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">URL de la vidéo</label>
      <Input
        placeholder="URL de la vidéo"
        value={video.video_url}
        onChange={(e) => setVideo({ ...video, video_url: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        required
      />
    </div>

    {/* LOCALISATION */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Localisation</label>
      <Input
        placeholder="Localisation"
        value={video.location}
        onChange={(e) => setVideo({ ...video, location: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        required
      />
    </div>

    {/* CONTRAT */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
      <Input
        placeholder="CDI, CDD..."
        value={video.contract_type}
        onChange={(e) => setVideo({ ...video, contract_type: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
        required
      />
    </div>

    {/* SALAIRE */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Salaire annuel</label>
      <Input
        placeholder="Ex : 35k"
        value={video.salary || ""}
        onChange={(e) => setVideo({ ...video, salary: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#4d307cff] focus:border-[#4d307cff]"
      />
    </div>

    {/* BOUTON */}
    <Button
      type="submit"
      disabled={submitting}
      className="w-full py-3 rounded-lg bg-[#4d307cff] text-white font-semibold hover:bg-[#3e2666] transition-colors duration-300"
    >
      {submitting ? "Mise à jour..." : "Sauvegarder"}
    </Button>
  </form>
</div>

  );
}

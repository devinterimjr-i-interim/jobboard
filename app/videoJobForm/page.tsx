"use client";

import * as Sentry from "@sentry/nextjs";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function VideoJobFormPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [contractType, setContractType] = useState("");
  const [salary, setSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Page loading pour éviter le flash
  const [loadingPage, setLoadingPage] = useState(true);

  // 🔒 Vérification admin
  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/auth"); // redirection si non connecté
        return;
      }

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
          router.push("/"); // redirection si pas admin
          return;
        }

        // Tout est OK : on peut afficher la page
        setLoadingPage(false);

      } catch (err) {
        Sentry.captureException(err);
        router.push("/");
      }
    };

    checkAccess();
  }, [user, authLoading, router, toast]);

  // Sécurisation des champs
  const sanitize = (v: string) => v.trim().replace(/[<>]/g, "");

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast({ title: "Vidéo requise", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // Upload vidéo
      const filePath = `admin/${Date.now()}-${videoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("video_job")
        .upload(filePath, videoFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("video_job")
        .getPublicUrl(filePath);

      // Appel API
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch("/api/video_job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: sanitize(title),
          video_url: urlData.publicUrl,
          location: sanitize(location),
          contract_type: sanitize(contractType),
          salary: sanitize(salary),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Offre vidéo publiée avec succès 🎉" });
      router.push("/");

      // Reset formulaire
      setTitle("");
      setVideoFile(null);
      setLocation("");
      setContractType("");
      setSalary("");

    } catch (error: any) {
      console.error(error);
      Sentry.captureException(error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de la publication",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loader si vérification en cours
  if (loadingPage || authLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 bg-white border-gray-500 rounded-xl shadow-sm">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Publier une offre vidéo
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border-gray-300"
        />

        <Input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          required
          className="border-gray-300"
        />

        <Input
          placeholder="Localisation"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="border-gray-300"
        />

        <Input
          placeholder="Type de contrat"
          value={contractType}
          onChange={(e) => setContractType(e.target.value)}
          required
          className="border-gray-300"
        />

        <Input
          placeholder="Salaire"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="border-gray-300"
        />

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#4d307cff] border-gray-300 text-white"
        >
          {submitting ? "Publication..." : "Publier"}
        </Button>
      </form>
    </div>
  );
}

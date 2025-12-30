"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function RecruiterConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const confirmRecruiter = async () => {
      try {
        const { error } = await supabase
          .from("recruiters")
          .update({ is_confirmed: true, status: "approved", confirmation_token: null })
          .eq("confirmation_token", token);

        setStatus(error ? "error" : "success");
      } catch (err) {
        console.error("Erreur lors de la confirmation:", err);
        setStatus("error");
      }
    };

    confirmRecruiter();
  }, [token]);

  const handleHome = () => router.push("/");

  const getMessage = () => {
    switch (status) {
      case "loading":
        return "Confirmation en cours...";
      case "error":
        return "❌ Lien invalide ou expiré";
      case "success":
        return "✅ Compte recruteur confirmé avec succès";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <p className="text-lg font-semibold mb-6">{getMessage()}</p>
        {status !== "loading" && (
          <Button
            className="bg-[#4d307cff] text-white hover:bg-[#371f7a]"
            onClick={handleHome}
          >
            Retour à l'accueil
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";

interface Recruiter {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  sector: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  siret: string;
  docsiren_path: string | null;
}

const AdminRecruiters = () => {
  const { user } = useAuth();
  const [listRecruiters, setListRecruiters] = useState<Recruiter[]>([]);
  const [inputSearch, setInputSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================================
     🔹 DOCUMENT SIREN (VIEW)
  ================================= */
  async function recup(path: string | null) {
    if (!path) return alert("Aucun document disponible");

    const { data, error } = await supabase
      .storage
      .from("company_verifications")
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      alert("Impossible d’ouvrir le document");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  /* ================================
     🔹 ACCEPTER + SUPPRIMER DOC
  ================================= */
  async function acceptRecruiterAndDeleteDoc(
    recruiterId: string,
    docPath: string | null
  ) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      if (docPath) {
        await fetch("/api/admin/delete-doc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ path: docPath }),
        });
      }

      const { error } = await supabase
        .from("recruiters")
        .update({ status: "approved", docsiren_path: null })
        .eq("id", recruiterId);

      if (error) throw error;

      setListRecruiters(prev =>
        prev.map(r =>
          r.id === recruiterId
            ? { ...r, status: "approved", docsiren_path: null }
            : r
        )
      );

      alert("✅ Recruteur accepté");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erreur acceptation");
    }
  }

  /* ================================
     🔹 REFUSER
  ================================= */
  async function handleReject(recruiterId: string) {
    const { error } = await supabase
      .from("recruiters")
      .update({ status: "rejected" })
      .eq("id", recruiterId);

    if (!error) {
      setListRecruiters(prev =>
        prev.map(r =>
          r.id === recruiterId ? { ...r, status: "rejected" } : r
        )
      );
    }
  }

  /* ================================
     🔹 SUPPRIMER COMPTE + DOC
  ================================= */
  async function deleteRecruiterAndDoc(
    recruiterUserId: string,
    docPath: string | null
  ) {
    if (!confirm("⚠️ Suppression définitive. Continuer ?")) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    if (docPath) {
      await fetch("/api/admin/delete-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: docPath }),
      });
    }

    await fetch("/api/delete-recruiter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: recruiterUserId }),
    });

    setListRecruiters(prev =>
      prev.filter(r => r.user_id !== recruiterUserId)
    );
  }

  /* ================================
     🔹 ADMIN CHECK
  ================================= */
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return setLoading(false);

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(data?.role === "admin");
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  /* ================================
     🔹 FETCH
  ================================= */
  useEffect(() => {
    supabase.from("recruiters").select().then(({ data }) => {
      setListRecruiters(data || []);
    });
  }, []);

  const filteredRecruiters = listRecruiters.filter(r =>
    r.company_name.toLowerCase().includes(inputSearch.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!isAdmin) return <p className="text-center mt-10">Accès refusé</p>;

  /* ================================
     🔹 RENDER
  ================================= */
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow border-gray">

          {/* 💻 TABLE */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
          <TableRow className="border-b border-gray-200">

                  <TableHead>Entreprise</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecruiters.map(r => (
                  <TableRow key={r.id} className="border-b border-gray-200">
                    <TableCell>{r.company_name}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>
                      <button onClick={() => recup(r.docsiren_path)}>Voir</button>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <button
                        onClick={() => acceptRecruiterAndDeleteDoc(r.id, r.docsiren_path)}
                        className="bg-emerald-500 text-white px-2 py-1 rounded"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="bg-rose-500 text-white px-2 py-1 rounded"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={() => deleteRecruiterAndDoc(r.user_id, r.docsiren_path)}
                        className="bg-gray-200 px-2 py-1 rounded"
                      >
                        Supprimer
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 📱 CARDS */}
          <div className="md:hidden p-4 space-y-4">
            {filteredRecruiters.map(r => (
              <div key={r.id} className="border rounded-xl p-4">
                <h2 className="font-semibold">{r.company_name}</h2>
                <p className="text-sm">{r.status}</p>

                <button
                  onClick={() => recup(r.docsiren_path)}
                  className="mt-2 w-full bg-indigo-600 text-white py-2 rounded"
                >
                  Voir document
                </button>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    onClick={() => acceptRecruiterAndDeleteDoc(r.id, r.docsiren_path)}
                    className="bg-emerald-500 text-white py-2 rounded"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="bg-rose-500 text-white py-2 rounded"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => deleteRecruiterAndDoc(r.user_id, r.docsiren_path)}
                    className="bg-gray-200 py-2 rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminRecruiters;

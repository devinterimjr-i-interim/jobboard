"use client";

import * as Sentry from "@sentry/nextjs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  consentement: boolean;
  date_consentement: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 20;
  const router = useRouter();

  // Vérifie si l'utilisateur connecté est admin via sa session Supabase
  const checkAdmin = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return profile?.role === "admin";
    } catch (error) {
      Sentry.captureException(error);
      console.error("Erreur vérification admin :", error);
      return false;
    }
  };

  // Récupérer les utilisateurs avec pagination
  const fetchUsers = async (pageIndex: number) => {
    setLoading(true);
    try {
      const { data, count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setTotal(count || 0);
    } catch (error) {
      console.error("Erreur récupération utilisateurs :", error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce profil ?")) return;

    try {
      const res = await fetch("/api/delete-user", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ userId: id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      // Mise à jour instantanée de la liste côté front
      setUsers(prev => prev.filter(u => u.id !== id));
      setTotal(prev => prev - 1);

      alert("Profil supprimé avec succès !");
    } catch (error: any) {
      console.error("Erreur suppression :", error);
      Sentry.captureException(error);
      alert("Erreur lors de la suppression du profil : " + error.message);
    }
  };

  // Au montage, vérifier admin et charger la première page
  useEffect(() => {
    const init = async () => {
      const isAdmin = await checkAdmin();
  if (!isAdmin) {
  router.replace("/"); // ✅ retour accueil
  return;
}

      await fetchUsers(0);
    };
    init();
  }, [router]);

  const nextPage = () => {
    if ((page + 1) * PAGE_SIZE >= total) return;
    setPage(prev => prev + 1);
    fetchUsers(page + 1);
  };

  const prevPage = () => {
    if (page === 0) return;
    setPage(prev => prev - 1);
    fetchUsers(page - 1);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Chargement...
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 py-12 px-4 container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Liste de tous les utilisateurs</h1>
        <p className="mb-4 text-gray-600">
          Total : {total} utilisateur(s) — Page {page + 1} / {Math.ceil(total / PAGE_SIZE)}
        </p>

        <div className="overflow-x-auto bg-white rounded-xl border border-gray-300 shadow-md">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-300">
                <TableHead className="text-gray-700 font-semibold px-4 py-2">Nom complet</TableHead>
                <TableHead className="text-gray-700 font-semibold px-4 py-2">Email</TableHead>
                <TableHead className="text-gray-700 font-semibold px-4 py-2">Rôle</TableHead>
                <TableHead className="text-gray-700 font-semibold px-4 py-2">Consentement</TableHead>
                <TableHead className="text-gray-700 font-semibold px-4 py-2">Date consentement</TableHead>
                <TableHead className="text-gray-700 font-semibold px-4 py-2">Date création</TableHead>
                <TableHead className="text-gray-700 font-semibold px-4 py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map(u => (
                  <TableRow
                    key={u.id}
                    className="hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-indigo-400"
                  >
                    <TableCell className="px-4 py-2">{u.full_name}</TableCell>
                    <TableCell className="px-4 py-2">{u.email}</TableCell>
                    <TableCell className="px-4 py-2">{u.role}</TableCell>
                    <TableCell className="px-4 py-2">
                      {u.consentement ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Oui</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Non</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-2">{u.date_consentement ? new Date(u.date_consentement).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="px-4 py-2">
                      <Button
                        size="sm"
                        className="bg-red-500 text-white hover:bg-red-600 transition-colors"
                        onClick={() => handleDelete(u.id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" onClick={prevPage} disabled={page === 0}>
            Précédent
          </Button>
          <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" onClick={nextPage} disabled={(page + 1) * PAGE_SIZE >= total}>
            Suivant
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;

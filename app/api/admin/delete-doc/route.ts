import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 🔒 Vérification JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // 🔹 Vérification utilisateur
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const userId = userData.user.id;

    // 🔹 Récupérer le profil pour vérifier le document
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("siren_doc_path")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 });
    }

    const { path } = await req.json();
    if (!path) {
      return NextResponse.json({ error: "Aucun chemin fourni" }, { status: 400 });
    }

    if (profile.siren_doc_path !== path) {
      return NextResponse.json({ error: "Le document ne correspond pas à l'utilisateur" }, { status: 403 });
    }

    // 🔹 Suppression du fichier dans le storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("company_verifications")
      .remove([path]); // ne pas ajouter .pdf ici, path doit être exact

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    // 🔹 Mettre à jour le profil pour supprimer le chemin du document
    await supabaseAdmin
      .from("profiles")
      .update({ siren_doc_path: null })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur suppression SIREN:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

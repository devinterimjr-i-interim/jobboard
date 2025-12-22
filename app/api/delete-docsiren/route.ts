import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, userId } = body;

    if (!path || !userId) {
      return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 });
    }

    // 🔹 Récupérer le profil pour vérifier que le document appartient bien à l'utilisateur
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("siren_doc_path")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Profil non trouvé" }, { status: 404 });
    }

    if (profile.siren_doc_path !== path) {
      return NextResponse.json({ success: false, error: "Le document ne correspond pas à l'utilisateur" }, { status: 403 });
    }

    // 🔹 Supprimer le fichier dans le storage
    const { error: storageError } = await supabaseAdmin
      .storage.from("company_verifications")
      .remove([path]);

    if (storageError) {
      return NextResponse.json({ success: false, error: storageError.message }, { status: 500 });
    }

    // 🔹 Mettre à jour le profil pour supprimer le path
    await supabaseAdmin
      .from("profiles")
      .update({ siren_doc_path: null })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur suppression SIREN:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

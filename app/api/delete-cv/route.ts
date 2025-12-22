import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, cvPath } = await req.json();
    if (!userId || !cvPath) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    // Supprime le fichier
    const { error: storageError } = await supabaseAdmin.storage
      .from("cv_public")
      .remove([cvPath]);
    if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 });

    // Met à jour le profil
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ cv_public: null })
      .eq("id", userId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

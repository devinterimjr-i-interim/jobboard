import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const userId = userData.user.id;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { path } = await req.json();
    if (!path) return NextResponse.json({ error: "Aucun chemin fourni" }, { status: 400 });

    // Suppression du fichier dans le storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("company_verifications")
      .remove([path]);

    if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur suppression SIREN:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/simpleRateLimit";

export async function POST(req: Request) {
  try {
    // 🔒 Vérifie l'authentification
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    // 🔹 Rate limit par utilisateur
    if (!rateLimit(userData.user.id)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard" }, { status: 429 });
    }

    // 🔹 Récupère le fichier depuis formData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // 🔹 Vérifie le type PDF uniquement
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Seul le PDF est autorisé" }, { status: 400 });
    }

    // 🔹 Taille max 10MB
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 400 });
    }

    // 🔹 Nom de fichier sécurisé
    const fileName = `${userData.user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("cv_public")
      .upload(fileName, buffer, { contentType: "application/pdf" });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 🔹 Retour JSON
    return NextResponse.json({ success: true, path: fileName });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

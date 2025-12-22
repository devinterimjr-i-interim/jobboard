import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fileTypeFromBuffer } from "file-type";
import { rateLimit } from "@/lib/simpleRateLimit";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔒 Vérification JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const { data: dataUser, error: errorData } = await supabase.auth.getUser(token);
    const user = dataUser?.user;
    if (errorData || !user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    // 🔹 Rate limit par utilisateur
    if (!rateLimit(user.id)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard" }, { status: 429 });
    }

    // 🔹 Récupération du FormData et honeypot
    const formData = await req.formData();
    const honeypot = formData.get("website"); // champ caché anti-bot
    if (honeypot) {
      return NextResponse.json({ error: "Bot détecté" }, { status: 400 });
    }

    const filePDF = formData.get("file") as File;
    if (!filePDF) {
      return NextResponse.json({ error: "Aucun PDF fourni" }, { status: 400 });
    }

    // 🔹 Vérification type et taille PDF
    const pdfBuffer = Buffer.from(await filePDF.arrayBuffer());
    const pdfType = await fileTypeFromBuffer(pdfBuffer);
    if (!pdfType || pdfType.mime !== "application/pdf") {
      return NextResponse.json({ error: "PDF invalide" }, { status: 400 });
    }
    if (pdfBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF trop lourd" }, { status: 400 });
    }

    // 🔹 Nom de fichier sécurisé
    const fileName = `${user.id}/${Date.now()}_${filePDF.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // 🔹 Upload dans Supabase (bucket private)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cv_uploads")
      .upload(fileName, pdfBuffer, { contentType: "application/pdf", cacheControl: "3600", upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: "Échec upload Supabase" }, { status: 500 });
    }

    // 🔹 Retourne seulement le chemin relatif (pour bucket private)
    return NextResponse.json({
      path: uploadData.path
    }, { status: 200 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

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

    // 🔹 Récupération fichiers et honeypot
    const formData = await req.formData();
    if (formData.get("website")) {
      return NextResponse.json({ error: "Bot détecté" }, { status: 400 });
    }

    const fileLogo = formData.get("logo") as File;
    if (!fileLogo) return NextResponse.json({ error: "Aucun logo fourni" }, { status: 400 });

    // 🔹 Vérification logo
    const logoBuffer = Buffer.from(await fileLogo.arrayBuffer());
    const logoType = await fileTypeFromBuffer(logoBuffer);
    if (!logoType || !["image/png", "image/jpeg"].includes(logoType.mime)) {
      return NextResponse.json({ error: "Logo invalide" }, { status: 400 });
    }
    if (logoBuffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Logo trop lourd" }, { status: 400 });
    }

    // 🖼️ UPLOAD LOGO
    const logoPath = `recruiters/${user.id}/logo.png`;

    await supabase.storage
      .from("logos")
      .upload(logoPath, logoBuffer, {
        contentType: logoType.mime,
        cacheControl: "3600",
        upsert: true,
      });

    const { data: logoPublicUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(logoPath);

    if (!logoPublicUrlData?.publicUrl) {
      return NextResponse.json(
        { error: "Impossible de récupérer l'URL publique du logo" },
        { status: 500 }
      );
    }

    // 🔹 Retour
    return NextResponse.json(
      {
        logoUrl: logoPublicUrlData.publicUrl,
        logoPath,
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

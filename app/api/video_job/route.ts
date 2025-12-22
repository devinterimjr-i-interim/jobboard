import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/simpleRateLimit";

export async function POST(req: Request) {
  try {
    // 🔒 Vérification du token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // 🔹 Récupération user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const userId = userData.user.id;

    // 🔹 Vérification ADMIN
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }

    // 🔹 Rate limit (ex: 5 vidéos / minute)
    if (!rateLimit(userId, 5, 60_000)) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard" },
        { status: 429 }
      );
    }

    // 🔹 Récupération du body
    const body = await req.json();
    const { title, video_url, location, contract_type, salary } = body;

    if (!title || !video_url || !location || !contract_type) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // 🔹 Insert dans video_job (sans created_by)
    const { data, error } = await supabaseAdmin
      .from("video_job")
      .insert([
        {
          title,
          video_url,
          location,
          contract_type,
          salary,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, videoJob: data });

  } catch (err: any) {
    console.error("Erreur création offre vidéo:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

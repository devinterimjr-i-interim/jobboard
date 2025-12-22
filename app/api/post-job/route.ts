import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Utiliser la clé service role
import { rateLimit } from "@/lib/simpleRateLimit";

export async function POST(req: Request) {
  try {
    // Vérification du token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // Récupération de l'utilisateur via le token
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    // Rate limit : max 3 offres par minute
    if (!rateLimit(userData.user.id, 3, 60_000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard" }, { status: 429 });
    }

    // Récupération du body
    const body = await req.json();

    // Insert dans la table jobs
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert([{
        title: body.title,
        sector: body.sector,
        location: body.location,
        type: body.type,
        salary_range: body.salary_range,
        description: body.description,
        requirements: body.requirements,
        recruiter_id: body.recruiter_id,
        sector_id: body.sector_id,
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true, job: data?.[0] });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

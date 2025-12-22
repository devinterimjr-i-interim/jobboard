import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 1️⃣ Récupérer le recruteur
    const { data: recruiter } = await supabaseAdmin
      .from("recruiters")
      .select("id, logo_url, docsiren_path")
      .eq("user_id", userId)
      .maybeSingle();

    if (!recruiter) {
      // Rien à supprimer
      return NextResponse.json({ success: true });
    }

    const recruiterId = recruiter.id;

    // 2️⃣ Supprimer dépendances
    await supabaseAdmin.from("applications").delete().eq("recruiter_id", recruiterId);
    await supabaseAdmin.from("jobs").delete().eq("recruiter_id", recruiterId);

    // 3️⃣ Supprimer le recruteur
    await supabaseAdmin.from("recruiters").delete().eq("id", recruiterId);

    // 4️⃣ Supprimer logo
    if (recruiter.logo_url) {
      const path = recruiter.logo_url.split("/logos/")[1];
      if (path) {
        await supabaseAdmin.storage.from("logos").remove([path]).catch(() => {});
      }
    }

    // 5️⃣ Supprimer SIREN
    if (recruiter.docsiren_path) {
      await supabaseAdmin.storage.from("company_verifications").remove([recruiter.docsiren_path]).catch(() => {});
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur suppression recruteur:", error);
    return NextResponse.json({ error: "Database error deleting recruiter" }, { status: 500 });
  }
}

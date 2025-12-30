import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log("Suppression du recruteur pour userId :", userId);

    // Récupérer le recruteur
    const { data: recruiter, error: recruiterError } = await supabaseAdmin
      .from("recruiters")
      .select("id, logo_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (recruiterError) {
      console.error("Erreur récupération recruteur :", recruiterError);
      return NextResponse.json({ error: recruiterError.message }, { status: 500 });
    }

    if (!recruiter) {
      console.log("Aucun recruteur trouvé, rien à supprimer");
      return NextResponse.json({ success: true });
    }

    const recruiterId = recruiter.id;

    // Supprimer les applications du recruteur
    await supabaseAdmin.from("applications").delete().eq("recruiter_id", recruiterId);

    // Supprimer les jobs du recruteur
    await supabaseAdmin.from("jobs").delete().eq("recruiter_id", recruiterId);

    // Supprimer le recruteur
    await supabaseAdmin.from("recruiters").delete().eq("id", recruiterId);

    // Supprimer le logo si présent
    if (recruiter.logo_url) {
      const path = recruiter.logo_url.split("/logos/")[1];
      if (path) {
        await supabaseAdmin.storage.from("logos").remove([path]).catch((err) => {
          console.warn("Erreur suppression logo :", err);
        });
      }
    }

    console.log("Compte recruteur supprimé avec succès");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur suppression recruteur :", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

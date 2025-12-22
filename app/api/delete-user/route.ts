import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // 1. Supprimer les données
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    await supabaseAdmin.from("applications").delete().eq("user_id", userId);
    await supabaseAdmin.from("applicationvideo").delete().eq("users_id", userId);
    await supabaseAdmin.from("user_sector").delete().eq("user_id", userId);
    await supabaseAdmin.from("recruiters").delete().eq("user_id", userId);

    // 2. Supprimer les fichiers
    const buckets = ["cv_public", "cv_uploads"];
    for (const bucket of buckets) {
      const { data: files } = await supabaseAdmin.storage.from(bucket).list(userId);
      if (files?.length) {
        const paths = files.map((file) => `${userId}/${file.name}`);
        await supabaseAdmin.storage.from(bucket).remove(paths);
      }
    }

    // 3. Supprimer l'utilisateur AUTH en dernier
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    // Ignore l'erreur si l'utilisateur est déjà supprimé
    if (authError && authError.message !== "User not found") {
      console.error("Erreur auth deleteUser:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Tout est ok
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    return NextResponse.json({ error: "Database error deleting user" }, { status: 500 });
  }
}

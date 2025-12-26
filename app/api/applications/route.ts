import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/simpleRateLimit";

// 🔹 Fonction pour nettoyer le message
const sanitizeMessage = (input: string) => {
  return input
    .trim()                     // supprime espaces début/fin
    .replace(/<[^>]*>/g, "")    // supprime balises HTML
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, ""); // supprime caractères de contrôle sauf retours à la ligne
};


export async function POST(req: Request) {
  try {
    // 🔒 Vérifie l'authentification via Bearer token
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

    // 🔹 Récupère le fichier et autres champs depuis formData
    const formData = await req.formData();
    const jobId = formData.get("jobId")?.toString();
    const rawMessage = formData.get("message")?.toString() || "";
    const message = sanitizeMessage(rawMessage); // ← sanitize ici
    const cvFile = formData.get("cv") as File;

    if (!jobId || !cvFile) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // 🔹 Vérifie le type PDF/DOC/DOCX
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(cvFile.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
    }

    // 🔹 Taille max 10MB
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 400 });
    }

    // 🔹 Nom de fichier sécurisé
    const fileName = `${userData.user.id}/${Date.now()}_${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("cv_uploads")
      .upload(fileName, buffer, { contentType: cvFile.type });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 🔹 Récupérer profil utilisateur
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("id", userData.user.id)
      .single();
    if (profileError) throw profileError;

    // 🔹 Récupérer job pour le recruiter_id
    const { data: jobData, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("recruiter_id")
      .eq("id", jobId)
      .single();
    if (jobError) throw jobError;

    // 🔹 Insert candidature
    const { error: insertError } = await supabaseAdmin.from("applications").insert([{
      job_id: jobId,
      user_id: userData.user.id,
      full_name: profileData.full_name,
      email: profileData.email,
      message, // ← message déjà sanitized
      cv_url: fileName,
      recruiter_id: jobData.recruiter_id,
      status: "en_attente",
    }]);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: fileName });

  } catch (err: any) {
    console.error("Erreur API candidature:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

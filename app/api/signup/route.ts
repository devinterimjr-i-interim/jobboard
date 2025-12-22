import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

// Map simple pour rate limit côté serveur (mémoire)
const attemptsPerIP: Record<string, number[]> = {};

const RATE_LIMIT_MAX = 5; // max 5 tentatives
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 heure

function isRateLimited(ip: string) {
  const now = Date.now();
  attemptsPerIP[ip] = attemptsPerIP[ip]?.filter(ts => now - ts < RATE_LIMIT_WINDOW) || [];
  
  if (attemptsPerIP[ip].length >= RATE_LIMIT_MAX) return true;

  attemptsPerIP[ip].push(now);
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }

    const body = await req.json();
    const { fullName, email, password, consentement, mentions_legales, honeypot } = body;

    // ✅ Honeypot anti-bot
    if (honeypot) return NextResponse.json({ error: "Bot détecté" }, { status: 400 });

    // Validation basique
    if (!fullName || !email || !password || !consentement || !mentions_legales) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }

    // Inscription Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Création du profil
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user?.id,
      full_name: fullName,
      email,
      consentement,
      mentions_legales,
      date_consentement: new Date().toISOString(),
    });

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    return NextResponse.json({ success: true, message: "Inscription réussie !" });
    
  } catch (err: any) {
    console.error("Erreur inscription API:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

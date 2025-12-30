import { NextResponse } from "next/server";
import Mailjet from "node-mailjet";

// Vérifie que l'email est pro
const isProfessionalEmail = (email: string) => {
  if (!email) return false;

  email = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  const freeDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "live.com", "aol.com", "icloud.com", "protonmail.com",
    "mail.com", "yandex.com"
  ];

  const domain = email.split("@")[1];
  if (!domain || freeDomains.includes(domain)) return false;
  if (!domain.includes(".")) return false;

  return true;
};

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Email ou token manquant" }, { status: 400 });
    }

    ❌ Vérification email pro
    if (!isProfessionalEmail(email)) {
      return NextResponse.json({ error: "Veuillez utiliser un email professionnel valide" }, { status: 400 });
    }

    const mailjet = Mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC!,
      process.env.MJ_APIKEY_PRIVATE!
    );

    const confirmationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/recruiter-confirm?token=${token}`;

    await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: { Email: "devinterimjr@gmail.com", Name: "Ctonjob" },
            To: [{ Email: email }],
            Subject: "Confirmez votre compte recruteur",
            HTMLPart: `<p>Bonjour,</p>
                       <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour confirmer votre compte :</p>
                       <a href="${confirmationLink}">Confirmer mon compte</a>`,
          },
        ],
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

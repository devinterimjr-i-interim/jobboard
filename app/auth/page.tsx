"use client";

import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";

interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consentement: boolean;
  mentions_legales?: boolean;
}

const AuthContent = () => {
  const { user, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("signin");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  
  const [signUpData, setSignUpData] = useState<SignUpData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    consentement: false,
    mentions_legales: false,
  });

  const [honeypot, setHoneypot] = useState("");

  const violet = "#4d307cff";
  const inputBorderColor = "#d1d5db";

  function sanitizeInput(input: string) {
    return input.trim().replace(/[<>]/g, "");
  }


function capitalizeName(name: string) {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
    
}


  function isStrongPassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{12,}$/;
    return regex.test(password);
  }

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  // --- Connexion ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const cleanedEmail = sanitizeInput(signInData.email);
    const cleanedPassword = signInData.password.trim();

    if (!cleanedEmail.includes("@")) {
      setErrorMessage("Email invalide");
      setLoading(false);
      return;
    }

    if (!cleanedPassword) {
      setErrorMessage("Le mot de passe est obligatoire");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(cleanedEmail, cleanedPassword);
      if (result?.error) {
        const friendlyMessage =
          result.error.message === "Invalid login credentials"
            ? "Email ou mot de passe incorrect"
            : "Erreur lors de la connexion";
        setErrorMessage(friendlyMessage);
        Sentry.captureException(new Error("Erreur connexion utilisateur (login échoué)"));
      }
    } catch (error) {
      console.error("Erreur connexion:", error);
      Sentry.captureException(error);
      setErrorMessage("Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // --- Inscription ---
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage("");
  setSuccessMessage("");

  // Honeypot anti-bot
  if (honeypot !== "") {
    console.log("Bot détecté");
    return;
  }

  const cleanedFullName = sanitizeInput(signUpData.fullName);
  const cleanedEmail = sanitizeInput(signUpData.email);
  const cleanedPassword = signUpData.password.trim();
  const cleanedConfirmPassword = signUpData.confirmPassword.trim();

  // Validations front
  if (!cleanedFullName) {
    setErrorMessage("Le nom complet est obligatoire");
    return;
  }

  const nameParts = cleanedFullName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    setErrorMessage("Veuillez entrer votre prénom et votre nom (au moins deux mots)");
    return;
  }

  if (!cleanedEmail.includes("@")) {
    setErrorMessage("Email invalide");
    return;
  }

  if (!isStrongPassword(cleanedPassword)) {
    setErrorMessage(
      "Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre et un symbole."
    );
    return;
  }

  if (cleanedPassword !== cleanedConfirmPassword) {
    setErrorMessage("Les mots de passe ne correspondent pas");
    return;
  }

  if (!signUpData.consentement) {
    setErrorMessage("Vous devez accepter la politique de confidentialité");
    return;
  }

  if (!signUpData.mentions_legales) {
    setErrorMessage("Vous devez accepter les mentions légales");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: cleanedFullName,
        email: cleanedEmail,
        password: cleanedPassword,
        consentement: signUpData.consentement,
        mentions_legales: signUpData.mentions_legales,
        honeypot,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.error || "Erreur lors de l'inscription");
      return;
    }

    setSuccessMessage(
      data.message || "Inscription réussie !"
    );

    // Reset du formulaire
    setSignUpData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      consentement: false,
      mentions_legales: false,
    });

    setTimeout(() => {
      setActiveTab("signin");
      setSuccessMessage("");
    }, 5000);
    
  } catch (error: any) {
    console.error("Erreur inscription API:", error);
    setErrorMessage(error.message || "Erreur serveur");
    Sentry.captureException(error, { extra: { email: cleanedEmail, errorType: typeof error } });
  } finally {
    setLoading(false);
  }
};


  const inputClasses = "border-b focus:border-violet-700 focus:ring-0 outline-none transition-colors";

  return (
<main className="flex-1 flex items-center justify-center py-16 bg-gray-50">
  <div className="container mx-auto px-4 max-w-md">
    <Card className="shadow-xl border border-gray-200 rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-gray-900">
          Bienvenue sur Next'Job
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Messages d'erreur / succès */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Tabs Connexion / Inscription */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1 gap-1">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-lg font-semibold transition"
            >
              Connexion
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-lg font-semibold transition"
            >
              Inscription
            </TabsTrigger>
          </TabsList>

          {/* Connexion */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="flex flex-col">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  className="border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#4d307c] focus:border-[#4d307c] text-base"
                  required
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="signin-password">Mot de passe</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#4d307c] focus:border-[#4d307c] text-base"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4d307c] text-white font-semibold rounded-xl py-3 hover:bg-[#3d2063] transition text-lg"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </TabsContent>

          {/* Inscription */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="flex flex-col">
                <Label htmlFor="signup-name">Nom complet</Label>
                <Input
                  id="signup-name"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: capitalizeName(e.target.value) })}
                  className="border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#4d307c] focus:border-[#4d307c] text-base"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className="border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#4d307c] focus:border-[#4d307c] text-base"
                  required
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className="border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#4d307c] focus:border-[#4d307c] text-base"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Min. 12 caractères, 1 majuscule, 1 chiffre, 1 symbole</p>
              </div>

              <div className="flex flex-col">
                <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className="border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#4d307c] focus:border-[#4d307c] text-base"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded"
                  checked={signUpData.consentement}
                  onChange={(e) => setSignUpData({ ...signUpData, consentement: e.target.checked })}
                  required
                />
                J'accepte la <Link href="/privacy" className="text-[#4d307c] underline">Politique de confidentialité</Link>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded"
                  checked={signUpData.mentions_legales}
                  onChange={(e) => setSignUpData({ ...signUpData, mentions_legales: e.target.checked })}
                  required
                />
                J’ai lu et j’accepte les <Link href="/mentions-legales" className="text-[#4d307c] underline">Mentions légales</Link>
              </label>

              {/* Honeypot anti-bot */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="absolute left-[-9999px] top-auto w-[1px] h-[1px] overflow-hidden"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4d307c] text-white font-semibold rounded-xl py-3 hover:bg-[#3d2063] transition text-lg"
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</main>

  );
};

const Auth = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={<main className="flex-1 flex items-center justify-center py-12"><div className="text-gray-600">Chargement...</div></main>}>
        <AuthContent />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Auth;

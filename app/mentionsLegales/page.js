"use client";

import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
          Mentions légales
        </h1>

        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">1. Éditeur du site</h2>
        <p className="mb-4 text-sm sm:text-base">
          Nom : <strong>I-Intérim SARL</strong><br />
          Siège social : 45 Avenue des Entrepreneurs, 75015 Paris, France<br />
          Email : <strong>contact@i-interim.fr</strong><br />
          SIRET : 123 456 789 00012<br />
          Directeur de publication : Marie Dupont
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">2. Hébergeur du site</h2>
        <p className="mb-4 text-sm sm:text-base">
          Hébergeur : Vercel Inc.<br />
          Adresse : 340 S Lemon Ave, Walnut, CA 91789, USA<br />
          Site web : <Link href="https://vercel.com" className="text-purple-700 hover:underline">https://vercel.com</Link><br />
          Email : support@vercel.com
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">3. Objet du site</h2>
        <p className="mb-4 text-sm sm:text-base">
          I-Intérim est une plateforme de mise en relation entre candidats et recruteurs pour des offres d’emploi et missions d’intérim.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">4. Propriété intellectuelle</h2>
        <p className="mb-4 text-sm sm:text-base">
          Tous les contenus du site (textes, images, logos, code) sont la propriété exclusive de I-Intérim, sauf mention contraire. Toute reproduction ou utilisation sans autorisation est interdite.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">5. Protection des données personnelles</h2>
        <p className="mb-4 text-sm sm:text-base">
          Les données collectées sont traitées conformément à la <Link href="/privacy" className="text-purple-700 hover:underline">Politique de confidentialité (RGPD)</Link>. Les utilisateurs disposent d’un droit d’accès, de modification et de suppression de leurs données.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">6. Responsabilité</h2>
        <p className="mb-4 text-sm sm:text-base">
          I-Intérim ne peut être tenu responsable des informations fournies par les recruteurs ou des contenus des offres publiées par des tiers.
        </p>

        <p className="text-xs sm:text-sm mt-6 text-gray-600 text-center sm:text-left">
          Dernière mise à jour : 24/11/2025
        </p>

        <div className="mt-6 text-center sm:text-left">
          <Link href="/" className="text-purple-700 font-semibold hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";

export default function CGUPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">
        Conditions Générales d'Utilisation (CGU) — C'tonjob
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Dernière mise à jour : 2025
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">1. Objet</h2>
      <p className="mb-4">
        Les présentes CGU encadrent l'accès et l'utilisation du site{" "}
        <strong>C'tonjob</strong>, projet de la société{" "}
        <strong>I-Intérim SARL</strong>, plateforme de publication et de
        consultation d'offres d'emploi.
        En utilisant le site, vous acceptez sans réserve les présentes CGU.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">
        2. Création de compte recruteur
      </h2>
      <p className="mb-2">
        La création d’un compte recruteur est strictement réservée aux
        professionnels.
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Une adresse email professionnelle valide est obligatoire.</li>
        <li>
          L’adresse email doit être confirmée via un lien de validation envoyé
          automatiquement par la plateforme.
        </li>
      </ul>
      <p className="mb-4">
        Tant que l’adresse email n’a pas été confirmée, le compte recruteur
        reste inactif et ne permet pas la publication d’offres d’emploi.
      </p>
      <p className="mb-4">
        Toute tentative d’utilisation d’une adresse non professionnelle,
        fictive, trompeuse ou visant à contourner le système de vérification
        entraînera la suspension ou le bannissement définitif du compte.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">
        3. Validation des offres d’emploi
      </h2>
      <p className="mb-4">
        Toute offre d’emploi publiée par un recruteur est soumise à une
        validation préalable par un administrateur.
        Aucune offre ne sera visible sur la plateforme tant qu’elle n’aura pas
        été examinée et approuvée.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">
        4. Obligations des utilisateurs
      </h2>
      <ul className="list-disc list-inside mb-4">
        <li>Fournir des informations exactes et vérifiables.</li>
        <li>Utiliser exclusivement une adresse email professionnelle.</li>
        <li>
          Ne publier aucun contenu illégal, injurieux, discriminatoire,
          frauduleux ou trompeur.
        </li>
        <li>Ne pas usurper une identité.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">
        5. Refus, suspension et bannissement
      </h2>
      <p className="mb-2">
        <strong>I-Intérim</strong> se réserve le droit de suspendre ou bannir
        un compte dans les cas suivants :
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Email non professionnel ou non confirmé</li>
        <li>Informations fausses ou trompeuses</li>
        <li>Offres frauduleuses ou fictives</li>
        <li>Comportement abusif ou malveillant</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">6. Responsabilité</h2>
      <p className="mb-4">
        <strong>I-Intérim</strong> agit uniquement en tant qu’hébergeur.
        La responsabilité de la plateforme ne peut être engagée pour les
        contenus publiés par les utilisateurs.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">
        7. Données personnelles
      </h2>
      <p className="mb-4">
        Les données sont traitées conformément au RGPD.
        Voir la{" "}
        <Link href="/privacy" className="underline">
          Politique de confidentialité
        </Link>.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">
        8. Modification des CGU
      </h2>
      <p className="mb-4">
        Les CGU peuvent être mises à jour à tout moment.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">9. Contact</h2>
      <p className="mb-4">
        Contact :{" "}
        <a href="mailto:s.hammami@i-interim.com" className="underline">
          s.hammami@i-interim.com
        </a>
      </p>

      <div className="mt-8">
        <Link href="/" className="text-sm underline">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}

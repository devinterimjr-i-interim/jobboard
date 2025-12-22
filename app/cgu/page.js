"use client";
import Link from 'next/link';

export default function CGUPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Conditions Générales d'Utilisation (CGU) — Next'Job</h1>
      <p className="text-sm text-gray-600 mb-6">Dernière mise à jour : 2025</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">1. Objet</h2>
      <p className="mb-4">
        Les présentes CGU encadrent l'accès et l'utilisation du site Next'Job, plateforme de publication et de consultation d'offres d'emploi.
        En utilisant le site, vous acceptez sans réserve ces CGU.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">2. Création de compte recruteur</h2>
      <p className="mb-2">
        La création d'un compte recruteur exige obligatoirement un justificatif officiel attestant l'existence de l'entreprise (ex : SIREN, Kbis, facture professionnelle).
        Sans ce justificatif valide, la création du compte sera refusée.
      </p>
      <p className="mb-4">
        Tout document faux, incomplet, falsifié ou trompeur entraînera le refus immédiat du compte ou sa suspension, voire un bannissement définitif.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">3. Obligations des utilisateurs</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Fournir des informations exactes et vérifiables.</li>
        <li>Ne publier aucun contenu illégal, injurieux, discriminatoire, violent, pornographique ou offensant.</li>
        <li>Ne publier aucune offre fictive, trompeuse, frauduleuse ou demandant un paiement préalable.</li>
        <li>Ne pas tenter de contourner les vérifications ou usurper une identité.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">4. Refus, suspension et bannissement</h2>
      <p className="mb-2">
        Next'Job se réserve le droit, sans préavis, de refuser, suspendre temporairement ou bannir définitivement tout compte, offre ou CV dans les cas suivants :
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Absence ou invalidité du justificatif officiel pour les comptes recruteurs.</li>
        <li>Informations fausses, incomplètes ou trompeuses.</li>
        <li>Propos ou contenus injurieux, discriminatoires, violents, offensants ou illégaux dans les offres, CV ou comptes.</li>
        <li>Offres frauduleuses, fictives, trompeuses ou demandant un paiement préalable.</li>
        <li>Usurpation d'identité, fraude ou tentative de fournir de faux documents.</li>
        <li>Attaques techniques ou activité malveillante nuisant à la plateforme.</li>
        <li>Non-respect des demandes légitimes des administrateurs.</li>
      </ul>
      <p className="mb-4">
        Ces règles s'appliquent à tous les utilisateurs et sont nécessaires pour garantir l'intégrité, la sécurité et la fiabilité de la plateforme.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">5. Responsabilité</h2>
      <p className="mb-4">
        Next'Job agit uniquement en tant qu’hébergeur. La responsabilité de la plateforme ne peut être engagée pour les contenus publiés par les utilisateurs.
        Chaque recruteur garantit la plateforme contre toute réclamation, action judiciaire ou dommage lié à ses publications.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">6. Données personnelles et cookies</h2>
      <p className="mb-4">
        Next'Job collecte et traite les données nécessaires au fonctionnement du service et à la vérification des comptes.
        Aucun cookie de suivi n'est utilisé ; seuls les cookies techniques strictement nécessaires peuvent être présents.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">7. Modification des CGU</h2>
      <p className="mb-4">
        Next'Job peut modifier ces CGU à tout moment. Les modifications importantes seront portées à la connaissance des utilisateurs par notification, email ou bannière.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">8. Contact</h2>
      <p className="mb-4">
        Pour toute question : <a href="mailto:contact@nextjob.fr" className="underline">contact@nextjob.fr</a>.
      </p>

      <div className="mt-8">
        <Link href="/" className="text-sm underline">Retour à l'accueil</Link>
      </div>
    </main>
  );
}

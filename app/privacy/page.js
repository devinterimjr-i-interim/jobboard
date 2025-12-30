"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
          Politique de confidentialité (RGPD)
        </h1>

        <p className="mb-4 text-sm sm:text-base">
          La protection de vos données personnelles est une priorité pour{" "}
          <strong>C&apos;tonjob</strong>, projet de la société{" "}
          <strong>I-Intérim SARL</strong>.
          Cette politique décrit la manière dont nous collectons, utilisons et
          protégeons vos données lors de l’utilisation de la plateforme.
        </p>

        {/* 1. Données collectées */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">
          1. Données collectées
        </h2>

        <p className="mb-2 font-semibold">Pour les candidats :</p>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li>Nom et prénom</li>
          <li>Adresse email</li>
          <li>Mot de passe (chiffré)</li>
          <li>CV et informations de candidature (offre, date, CV joint)</li>
        </ul>

        <p className="mb-2 font-semibold">Pour les recruteurs :</p>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li>Nom de l’entreprise</li>
          <li>Nom du contact</li>
          <li>Email professionnel</li>
          <li>Numéro de téléphone</li>
          <li>Secteur d’activité</li>
          <li>Site web</li>
          <li>Description de l’entreprise</li>
          <li>Taille de l’entreprise</li>
          <li>Localisation</li>
          <li>Logo</li>
        </ul>

        <p className="mb-2 font-semibold">Pour les administrateurs :</p>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li>
            Accès aux données des candidats et recruteurs pour la gestion et la
            modération
          </li>
          <li>Gestion des rôles et statuts des utilisateurs</li>
          <li>Suivi des candidatures et des offres publiées</li>
        </ul>

        {/* 2. Finalité */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">
          2. Finalité de la collecte
        </h2>

        <p className="font-semibold mb-2">Pour les candidats :</p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Gérer votre compte utilisateur</li>
          <li>Envoyer et suivre vos candidatures</li>
          <li>
            Mettre votre CV à disposition des recruteurs via le CV public
            (optionnel)
          </li>
          <li>Recevoir des notifications liées à votre activité</li>
        </ul>

        <p className="font-semibold mb-2">Pour les recruteurs :</p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Créer et gérer votre espace recruteur</li>
          <li>Publier et administrer vos offres d’emploi</li>
          <li>Recevoir et gérer les candidatures</li>
          <li>
            Confirmer la création du compte via un email professionnel et une
            validation par l’administrateur
          </li>
        </ul>

        <p className="font-semibold mb-2">Pour les administrateurs :</p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Assurer la sécurité et la conformité de la plateforme</li>
          <li>Valider, refuser ou supprimer les comptes recruteurs</li>
          <li>Modérer les offres et candidatures</li>
        </ul>

        {/* 3. Base légale */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">
          3. Base légale du traitement
        </h2>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li>
            <strong>Exécution du contrat</strong> : création de compte, gestion
            des profils, candidatures et offres.
          </li>
          <li>
            <strong>Consentement</strong> : mise à disposition volontaire du CV
            public.
          </li>
          <li>
            <strong>Intérêt légitime</strong> : sécurité, prévention des abus,
            modération des contenus.
          </li>
        </ul>

        {/* 4. Conservation */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">
          4. Conservation et suppression des données
        </h2>
        <p className="mb-4 text-sm sm:text-base">
          Les données sont conservées uniquement le temps nécessaire au
          fonctionnement de la plateforme.
        </p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>
            Suppression définitive des données personnelles lors de la fermeture
            du compte
          </li>
          <li>Suppression des CV et candidatures associées</li>
          <li>Suppression des données recruteur après désactivation du compte</li>
        </ul>

        {/* 5. Sécurité */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">
          5. Partage et sécurité
        </h2>
        <p className="mb-4 text-sm sm:text-base">
          Les données ne sont jamais revendues. Elles sont stockées sur une
          infrastructure sécurisée conforme au RGPD. L’accès est strictement
          limité selon les rôles utilisateurs.
        </p>

        {/* 6. Droits */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">
          6. Vos droits
        </h2>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li>Droit d’accès et de rectification</li>
          <li>Droit de suppression</li>
          <li>Droit d’opposition</li>
          <li>Droit à la portabilité</li>
          <li>Droit de réclamation auprès de la CNIL</li>
        </ul>

        <p className="mb-4 text-sm sm:text-base">
          Contact pour exercer vos droits :{" "}
          <strong>s.hammami@i-interim.com</strong>
        </p>

        <p className="text-xs sm:text-sm mt-6 text-gray-600 text-center sm:text-left">
          Dernière mise à jour : 25/11/2025
        </p>

        <div className="mt-6 text-center sm:text-left">
          <Link href="/" className="text-purple-700 font-semibold hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

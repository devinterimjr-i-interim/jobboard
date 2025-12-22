"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
          Politique de confidentialité (RGPD)
        </h1>

        <p className="mb-4 text-sm sm:text-base">
          La protection de vos données personnelles est une priorité pour <strong>Next’Job</strong>. 
          Cette politique décrit la manière dont nous collectons, utilisons et protégeons vos données 
          lors de l’utilisation de notre plateforme.
        </p>

        {/* 1. Données collectées */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">1. Données collectées</h2>

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
          <li>Numéro SIRET</li>
          <li>Secteur d’activité</li>
          <li>Site web</li>
          <li>Description de l’entreprise</li>
          <li>Taille de l’entreprise</li>
          <li>Localisation</li>
          <li>Logo</li>
          <li>Documents justificatifs (ex : Kbis)</li>
        </ul>

        <p className="mb-2 font-semibold">Pour les administrateurs :</p>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li>Accès complet aux données des candidats et recruteurs pour la gestion et la modération</li>
          <li>Accès aux informations de connexion et rôle des utilisateurs</li>
          <li>Suivi des candidatures et statut des entreprises</li>
        </ul>

        {/* 2. Finalité */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">2. Finalité de la collecte</h2>
        <p className="font-semibold mb-2">Pour les candidats :</p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Gérer votre compte utilisateur</li>
          <li>Envoyer et suivre vos candidatures</li>
          <li>Mettre votre CV à disposition des recruteurs via CV Tech (optionnel)</li>
          <li>Envoyer des notifications liées à votre activité</li>
        </ul>

        <p className="font-semibold mb-2">Pour les recruteurs :</p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Créer et gérer votre espace entreprise</li>
          <li>Publier et administrer vos offres d’emploi</li>
          <li>Permettre aux candidats de vous contacter</li>
          <li>Vérifier la légitimité de l’entreprise via SIRET et documents justificatifs</li>
        </ul>

        <p className="font-semibold mb-2">Pour les administrateurs :</p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Assurer la sécurité et la conformité de la plateforme</li>
          <li>Modérer les profils et offres publiées</li>
          <li>Suivre les candidatures et l’activité sur le site</li>
        </ul>

        {/* 3. Base légale */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">3. Base légale du traitement</h2>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li><strong>Exécution du contrat</strong> (art. 6.1.b) : création de compte, gestion du profil, candidatures, espace recruteur.</li>
          <li><strong>Consentement</strong> (art. 6.1.a) : partage volontaire du CV via CV Tech.</li>
          <li><strong>Intérêt légitime</strong> (art. 6.1.f) : prévention de fraude, vérification du SIRET et documents justificatifs, sécurité de la plateforme.</li>
        </ul>

        {/* 4. Conservation et suppression */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">4. Conservation et suppression des données</h2>
        <p className="mb-4 text-sm sm:text-base">
          Les données sont conservées uniquement le temps nécessaire à la gestion des comptes et activités. 
        </p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Suppression définitive des informations personnelles, CV et candidatures lors de la fermeture d’un compte</li>
          <li>Suppression ou anonymisation des données recruteur selon les obligations légales</li>
          <li>Documents justificatifs des entreprises sont supprimés après vérification ou désactivation du compte</li>
        </ul>

        {/* 5. Partage et sécurité */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">5. Partage et sécurité</h2>
        <p className="mb-4 text-sm sm:text-base">
          Les données ne sont jamais revendues. Elles sont stockées sur Supabase (hébergement européen compatible RGPD). 
          Les administrateurs peuvent accéder aux données pour gérer la plateforme et assurer sa sécurité.
        </p>

        {/* 6. Vos droits */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">6. Vos droits</h2>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base space-y-1">
          <li>Droit d’accès et de rectification</li>
          <li>Droit de suppression</li>
          <li>Droit d’opposition</li>
          <li>Droit à la portabilité</li>
          <li>Droit de réclamation auprès de la CNIL</li>
        </ul>
        <p className="mb-4 text-sm sm:text-base">
          Contact pour exercer vos droits : <strong>contact@nextjob.fr</strong>
        </p>

        {/* 7. CV Tech */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">7. Partage volontaire du CV (CV Tech)</h2>
        <p className="mb-4 text-sm sm:text-base">
          Les candidats peuvent rendre leur CV visible aux recruteurs via la CV Tech. 
          Le partage est optionnel et basé sur le consentement.
        </p>
        <ul className="list-disc list-inside mb-4 ml-4 text-sm sm:text-base space-y-1">
          <li>Nom et prénom</li>
          <li>Titre ou domaine recherché</li>
          <li>CV (si activé)</li>
        </ul>
        <p className="mb-4 text-sm sm:text-base text-red-600">
          ⚠️ Les candidatures envoyées via offres d’emploi transmettent automatiquement CV, nom et prénom au recruteur, même si le CV n’est pas partagé via CV Tech.
        </p>
        <div className="flex items-start gap-2 p-4 mb-4 border border-red-300 bg-red-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
          <p className="text-sm sm:text-base text-red-700">
            Le partage du CV via CV Tech peut être retiré à tout moment depuis votre profil.
          </p>
        </div>

        {/* 8. Cookies */}
        <h2 className="text-xl sm:text-2xl font-semibold mt-6 mb-3">8. Cookies</h2>
        <p className="mb-4 text-sm sm:text-base">
          Aucun cookie publicitaire ou de suivi n’est utilisé. Les cookies tiers éventuels nécessitent votre consentement.
        </p>

        <p className="text-xs sm:text-sm mt-6 text-gray-600 text-center sm:text-left">
          Dernière mise à jour : 25/11/2025
        </p>

        <div className="mt-6 text-center sm:text-left">
          <Link href="/" className="text-purple-700 font-semibold hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

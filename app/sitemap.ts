// app/sitemap.ts
export default function sitemap() {
  return [
    { url: "https://ton-domaine.com/", lastModified: new Date() }, // page d'accueil
    { url: "https://ton-domaine.com/jobs", lastModified: new Date() }, // liste des offres
    { url: "https://ton-domaine.com/recruiters", lastModified: new Date() }, // recruteurs
    // ici tu peux ajouter d'autres pages statiques
  ];
}

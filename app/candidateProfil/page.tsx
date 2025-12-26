"use client"

import { Header } from "@/components/Header";
import { User, Mail,CalendarDays, Briefcase, FileText, CheckCircle, Clock, XCircle, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import * as Sentry from "@sentry/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";


interface ProfileData {
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  cv_public: string | null;
}

interface Statistics {
  applications: number;
}

interface Application {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  cv_url: string;
  jobs: {
    title: string;
    sector: string;
    location: string;
  };
}

interface Sector {
  id: number;
  name: string;
}
interface VideoApplication {
  id: number;
  created_at: string;
  status: string;
  cv_url: string | null;
  message: string | null;
  videojob_id?: number;
  video_job: {
    title: string;
    location: string;
    contract_type: string;
  } | null;
}

const CandidateProfile = () => {
  const { user } = useAuth();
const router = useRouter();

  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({ applications: 0 });
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sector, setSector] = useState<Sector[]>([]);
  const [userSectors, setUserSectors] = useState<number[]>([]);
  const [nameCv, setNamecv] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

const [videoApplications, setVideoApplications] = useState<VideoApplication[]>([]);
useEffect(() => {
  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Récupération du profil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(profileData);

      // Nombre de candidatures classiques
      const { count: applicationsCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Nombre de candidatures vidéo
      const { count: videoApplicationsCount } = await supabase
        .from("applicationvideo")
        .select("*", { count: "exact", head: true })
        .eq("users_id", user.id);

      // Somme des deux
      setStatistics({ applications: (applicationsCount || 0) + (videoApplicationsCount || 0) });

      // Candidatures classiques
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("applications")
        .select(`
          id,
          job_id,
          status,
          created_at,
          cv_url,
          jobs (
            title,
            sector,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (applicationsError) throw applicationsError;

      setApplications(
        (applicationsData || []).map((app: any) => {
          let jobObj = { title: "", sector: "", location: "" };

          if (Array.isArray(app.jobs) && app.jobs.length > 0) {
            jobObj = {
              title: app.jobs[0]?.title ?? "",
              sector: app.jobs[0]?.sector ?? "",
              location: app.jobs[0]?.location ?? "",
            };
          } else if (app.jobs && typeof app.jobs === "object") {
            jobObj = {
              title: app.jobs.title ?? "",
              sector: app.jobs.sector ?? "",
              location: app.jobs.location ?? "",
            };
          }

          return {
            id: app.id,
            job_id: app.job_id,
            status: app.status,
            created_at: app.created_at,
            cv_url: app.cv_url,
            jobs: jobObj,
          };
        })
      );

      // Candidatures vidéo
      const { data: videoApplicationsData, error: videoApplicationsError } =
        await supabase
          .from("applicationvideo")
          .select(`
            id,
            status,
            created_at,
            cv_url,
            message,
            video_job:videojob_id (
              title,
              location,
              contract_type
            )
          `)
          .eq("users_id", user.id)
          .order("created_at", { ascending: false });

      if (videoApplicationsError) throw videoApplicationsError;
const transformedVideoApplications = (videoApplicationsData || []).map((app: any) => ({
  ...app,
  video_job: app.video_job || { title: "", location: "", contract_type: "" },
}));

setVideoApplications(transformedVideoApplications);


    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Erreur lors du chargement des données:", error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfileData();
}, [user]);



  
  async function fetchUserSector() {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_sector')
        .select()
        .eq('user_id', user.id);

      if (data) setUserSectors(data.map(el => el.sector_id));
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      Sentry.captureException(error);
    }
  }

  async function insertUserSectors(idSector: number) {
    if (!user) return;

    try {
      const isSelected = userSectors.includes(idSector);

      if (!isSelected) {
        const { error } = await supabase.from('user_sector').insert({
          user_id: user.id,
          sector_id: idSector
        });
        if (error) {
          if (process.env.NODE_ENV === "development") console.error(error);
          Sentry.captureException(error);
        }
      } else {
        const { error } = await supabase.from('user_sector')
          .delete()
          .eq('user_id', user.id)
          .eq('sector_id', idSector);
        if (error) {
          if (process.env.NODE_ENV === "development") console.error(error);
          Sentry.captureException(error);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      Sentry.captureException(error);
    }
  }
async function openCv(cvPath: string) {
  if (!cvPath) {
    alert("Aucun chemin de CV fourni");
    return;
  }

  try {
    const { data, error } = await supabase.storage
      .from('cv_uploads')
      .createSignedUrl(cvPath, 60); // 60 secondes de validité

    if (error) {
      console.error("Erreur création URL signée:", error);
      alert("Impossible d’ouvrir le document: " + error.message);
      return;
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      alert("Impossible de récupérer l'URL du CV");
    }
  } catch (err) {
    console.error("Erreur inattendue lors de l'ouverture du CV:", err);
    alert("Une erreur est survenue");
  }
}



  async function fetchSector() {
    try {
      const { data } = await supabase.from('sectors').select();
      setSector(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      Sentry.captureException(error);
    }
  }

async function insertCv() {
  if (!user) return;
  if (!file || !nameCv.trim()) {
    alert("Veuillez sélectionner un fichier et renseigner le poste");
    return;
  }

  setUploading(true);

  try {
    // Supprime l'ancien CV si présent
    if (profile?.cv_public) await deleteCurrentCv(profile.cv_public);

    // Crée le FormData pour l'API
    const formData = new FormData();
    formData.append("file", file);

    // Récupère le token d'accès de Supabase
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      alert("Utilisateur non authentifié");
      setUploading(false);
      return;
    }
 



    const res = await fetch("/api/cv_public", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Erreur lors de l'upload : " + (data.error || "Erreur inconnue"));
      setUploading(false);
      return;
    }

    const uploadedPath = data.path;

    // Met à jour le profil avec le chemin du CV et le desired_job
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        cv_public: uploadedPath,
        desired_job: nameCv.trim() // <-- insère le nom du poste ici
      })
      .eq("id", user.id);

    if (updateError) {
      alert("CV uploadé mais erreur lors de la mise à jour du profil");
      console.error(updateError);
    } else {
    alert("CV et poste désiré mis à jour avec succès !");
      setFile(null);
      setNamecv("");
      const { data: newProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(newProfile);
    }
  } catch (err) {
    console.error("Erreur upload CV :", err);
    alert("Une erreur s'est produite lors de l'upload du CV");
  } finally {
    setUploading(false);
  }
}


async function deleteCurrentCv(cvPath: string) {
  if (!user || !cvPath) {
    alert("Aucun CV à supprimer");
    return;
  }

  try {
    const res = await fetch("/api/delete-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, cvPath }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Erreur serveur");

    alert("CV supprimé avec succès !");
   setProfile(prev => prev ? { ...prev, cv_public: null } : null);

  } catch (error: any) {
    console.error("Erreur suppression CV :", error);
    alert("Erreur lors de la suppression du CV: " + error.message);
  }
}


async function deleteProfilUser() {
  if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;

  if (!user?.id) {
    alert("Erreur: utilisateur non connecté");
    return;
  }

  try {
    // Suppression compte recruteur (tolérant si inexistant)
    await fetch("/api/delete-recruiter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    // Suppression compte utilisateur
    const res = await fetch("/api/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur suppression compte");

    // Logout
    await supabase.auth.signOut();

    // Redirection
    // ⚠️ Ici on utilise replace pour éviter que l'utilisateur revienne sur la page avec le bouton "Précédent"
window.location.href = "/auth";



  } catch (error: any) {
    console.error("Erreur suppression compte:", error);
    alert("Erreur lors de la suppression du compte: " + error.message);
  }
}



  useEffect(() => {
    if (!user) return;
    fetchSector();
    fetchUserSector();
  }, [user]);

  function getBadge(app: { status: string }) {
    switch (app.status) {
      case "en_attente":
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case "acceptee":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Acceptée</Badge>;
      case "declinee":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" />Déclinée</Badge>;
      case "consultée":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"><Clock className="w-3 h-3 mr-1" />Consultée</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-300">Inconnu</Badge>;
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      candidat: "Candidat",
      recruiter: "Recruteur",
      admin: "Administrateur",
    };
    return roles[role] || role;
  };

  return (
  <div className="min-h-screen bg-gray-50">
  <Header />

  <div className="container mx-auto px-4 py-8 max-w-7xl">
    {/* Header */}
    <div className="mb-8 text-center sm:text-left">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Mon profil</h1>
      <p className="text-gray-600 text-sm sm:text-base">
        Gérez vos informations personnelles et consultez vos statistiques
      </p>
    </div>

    {/* Tabs */}
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-2 gap-1 bg-gray-100 rounded-lg p-1">
        <TabsTrigger value="profile" className="bg-gray-100 data-[state=active]:bg-white font-semibold rounded-lg py-2 text-sm sm:text-base">
          Profil
        </TabsTrigger>
        <TabsTrigger value="applications" className="bg-gray-100 data-[state=active]:bg-white font-semibold rounded-lg py-2 text-sm sm:text-base">
          Candidatures envoyées
        </TabsTrigger>
      </TabsList>

      {/* Profil */}
      <TabsContent value="profile" className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none rounded-lg sm:shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <User className="w-5 h-5 text-[#4d307cff]" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </>
            ) : (
              <>
                {[{ icon: <User className="text-[#4d307cff] 0 w-5 h-5" />, label: "Nom complet", value: profile?.full_name },
                  { icon: <Mail className="text-[#4d307cff] w-5 h-5" />, label: "Email", value: profile?.email },
                  { icon: <CalendarDays className="text-[#4d307cff] w-5 h-5" />, label: "Date d'inscription", value: profile ? formatDate(profile.created_at) : "Non renseigné" },
                ].map((info, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200">{info.icon}</div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">{info.label}</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{info.value || "Non renseigné"}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card className="bg-white border-none rounded-lg sm:shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#4d307cff]" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <>
                <div className="p-4 rounded-lg bg-indigo-50">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[#4d307cff]" />
                    <p className="text-sm font-medium text-gray-500">Candidatures envoyées</p>
                  </div>
                  <h2 className="text-3xl font-bold text-[#4d307cff]">{statistics.applications}</h2>
                </div>
                <div className="p-4 rounded-lg bg-gray-100 text-center text-sm text-gray-600">
                  Continuez à postuler pour augmenter vos chances de trouver le poste idéal !
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Applications */}
      <TabsContent value="applications" className="mt-6">
        <Card className="bg-white border-none rounded-lg sm:shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4d307cff]" />
              Mes candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vous n'avez envoyé aucune candidature pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <Table className="min-w-[500px] sm:min-w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-none">
                      <TableHead>Poste</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-gray-50 transition-colors border-gray-300">
                        <TableCell className="font-medium">{app.jobs.title}</TableCell>
                        <TableCell className="text-gray-500">{app.jobs.location}</TableCell>
                        <TableCell>{getBadge(app)}</TableCell>
                        <TableCell className="text-gray-500">{formatDate(app.created_at)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openCv(app.cv_url)}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            CV
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                            {videoApplications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-gray-50 transition-colors border-gray-300">
                        <TableCell className="font-medium">{app.video_job?.title}</TableCell>
                        <TableCell className="text-gray-500">{app.video_job?.location}</TableCell>
                        <TableCell>{getBadge(app)}</TableCell>
                        <TableCell className="text-gray-500">{formatDate(app.created_at)}</TableCell>
                        <TableCell>
                       <Button
  variant="ghost"
  size="sm"
  onClick={() => app.cv_url && openCv(app.cv_url)}
  disabled={!app.cv_url} // optionnel : désactive le bouton si aucun CV
>
  <ExternalLink className="w-4 h-4 mr-1" />
  CV
</Button>

                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    {/* Secteurs et CV */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Secteurs recherchés */}
      <Card className="bg-white border-none rounded-lg sm:shadow-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-[#4d307cff]" />
          <h2 className="text-lg sm:text-xl font-semibold">Secteurs recherchés</h2>
        </div>
        <p className="text-sm text-gray-500 mb-3">Sélectionnez les secteurs qui vous intéressent</p>
        <div className="flex flex-wrap gap-2">
          {sector.map((s) => {
            const isSelected = userSectors.includes(s.id);
            return (
              <button
                key={s.id}
                className={`rounded-lg px-3 py-1 text-sm flex items-center gap-1 transition-colors
                  ${isSelected ? "bg-[#4d307cff] text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => {
                  if (isSelected) setUserSectors(prev => prev.filter(id => id !== s.id));
                  else setUserSectors(prev => [...prev, s.id]);
                  insertUserSectors(s.id);
                }}
              >
                <Briefcase className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-500"}`} />
                {s.name.trim()}
              </button>
            );
          })}
        </div>
      </Card>

      {/* CV */}
      <Card className="bg-white  border-none rounded-lg sm:shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#4d307cff]" />
            <h2 className="text-lg sm:text-xl font-semibold">Mon CV</h2>
          </div>
   {profile?.cv_public && (
  <Button
    variant="destructive"
    size="sm"
    onClick={() => deleteCurrentCv(profile.cv_public!)} // le ! dit à TypeScript que ce n'est pas null ici
  >
    <Trash2 className="w-4 h-4 mr-1" />
    Supprimer le CV
  </Button>
)}
        </div>

        <p className="text-sm text-gray-500 mb-2">
          ℹ️ En partageant votre CV ici, votre prénom, nom et CV seront accessibles aux recruteurs.
        </p>

        {profile?.cv_public && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
            ✅ Un CV est déjà enregistré. Upload un nouveau fichier le remplacera.
          </div>
        )}

        <div className="w-full rounded-lg p-2 flex items-center justify-between cursor-pointer bg-gray-100 hover:bg-gray-200 relative mb-4">
          <span className="text-sm">{file ? file.name : "Choisir un fichier PDF"}</span>
          <input
            type="file"
            accept=".pdf"
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}/>
        </div>
{/* 
        <input
          type="text"
          placeholder="Nom du poste recherché (ex: Développeur Web)"
          value={nameCv}
          onChange={(e) => setNamecv(e.target.value)}
          className="w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4"/> */}
<select
  value={nameCv}
  onChange={(e) => setNamecv(e.target.value)}
  className="w-full rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4"
>
  <option value="">Sélectionnez un secteur</option>
  {sector.map((s) => (
    <option key={s.id} value={s.name.trim()}>
      {s.name.trim()}
    </option>
  ))}
</select>

        <button
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={insertCv}
          disabled={uploading || !file || !nameCv.trim()}
        >
          {uploading ? "Upload en cours..." : "Uploader mon CV"}
        </button>
      </Card>
    </div>

    {/* Supprimer le profil */}
    <Card className="bg-red-50 border-none rounded-lg mt-6 p-6 flex flex-col items-center text-center">
      <h1 className="text-xl font-bold text-red-600">Supprimer son profil</h1>
      <p className="mt-2 text-gray-700 text-sm max-w-md text-center">
        Supprimer votre compte supprimera définitivement toutes vos informations personnelles,
        y compris votre profil, vos candidatures, vos fichiers et votre consentement RGPD.
        Cette action est irréversible.
      </p>
      <button
        className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
        type="button"
        onClick={deleteProfilUser}
      >
        Supprimer mon compte
      </button>
    </Card>
  </div>
</div>

  );
};

export default CandidateProfile;
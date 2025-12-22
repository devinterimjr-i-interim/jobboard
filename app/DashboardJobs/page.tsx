"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, FileText, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import "@/app/stylesPlus.css";
import { JobForm } from "@/components/dashboard/JobForm";
import { Header } from "@/components/Header";

interface Job {
  id: string;
  title: string;
  sector: string;
  location: string;
  type: string;
  description: string;
  salary_range?: string;
  is_valid: boolean;
}

interface VideoJob {
  id: number;
  title: string;
  video_url: string;
  location: string;
  contract_type: string;
  salary?: string;
}

interface VideoApplication {
  id: string;
  full_name: string;
  email: string;
  cv_url: string;
  message: string;
  videojob_id: number;
  created_at?: string;
}

export default function DashboardJobs() {
  const router = useRouter();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const [editingVideoJob, setEditingVideoJob] = useState<VideoJob | null>(null);

  const [showVideoApplications, setShowVideoApplications] = useState(false);
  const [videoApplications, setVideoApplications] = useState<VideoApplication[]>([]);
  const [loadingVideoApps, setLoadingVideoApps] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchVideoJobs();
    fetchVideoApps();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  };

  const fetchVideoJobs = async () => {
    const { data } = await supabase
      .from("video_job")
      .select("*")
      .order("created_at", { ascending: false });
    setVideoJobs(data || []);
  };

  const fetchVideoApps = async () => {
    setLoadingVideoApps(true);
    const { data } = await supabase
      .from("applicationvideo")
      .select("*")
      .order("created_at", { ascending: false });
    setVideoApplications(data || []);
    setLoadingVideoApps(false);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Supprimer cette offre ?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    toast({ title: "Offre supprimée" });
    fetchJobs();
  };


const handleDeleteVideoJob = async (id: string, title: string) => {

  const response = await fetch("/api/delete-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: title }),
    });

    const result = await response.json();

    const responseTable = await supabase.from('video_job').delete().eq('id', id)

    setVideoJobs((prev)=> prev.filter((job)=>job.id !==id))
  };

  
  
  const handleDeleteVideoApplication = async (id: string) => {
    if (!confirm("Supprimer cette candidature ?")) return;
    await supabase.from("applicationvideo").delete().eq("id", id);
    toast({ title: "Candidature supprimée" });
    fetchVideoApps();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingJob(null);
    setEditingVideoJob(null);
    fetchJobs();
    fetchVideoJobs();
  };



const navigate=useRouter();


  const filteredJobs = jobs.filter((job) =>
    [job.title, job.sector, job.location].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

if (showForm) {
  return (
    <div className="mt-6">
   
      {/* On ne passe que editingJob */}
      <JobForm job={editingJob} onSuccess={handleFormSuccess} />
    </div>
  );
}

  return (
    
<div className="p-4 sm:p-6 min-h-screen bg-gray-50">

  {/* Header */}
  <div className="text-center mb-8 sm:mb-10">
    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 sm:mb-6">Gestion des offres</h2>

    {/* Menu Boutons */}
<div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 border-t border-b border-gray-300 py-3 sm:py-2">
  <Button
    onClick={() => setShowForm(true)}
    className="w-full sm:w-auto text-gray-800 px-4 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
    Nouvelle offre
  </Button>

  <Link href="/DashboardApplications">
    <Button className="w-full sm:w-auto text-gray-800 px-4 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
      Candidatures
    </Button>
  </Link>

  <Link href="/ListUser">
    <Button className="w-full sm:w-auto text-gray-800 px-4 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
      Liste des utilisateurs
    </Button>
  </Link>

  <Link href="/AdminRecruiters">
    <Button className="w-full sm:w-auto text-gray-800 px-4 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
      Comptes à valider
    </Button>
  </Link>

  <Link href="/videoJobForm">
    <Button className="w-full sm:w-auto text-gray-800 px-4 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
      Publier offre vidéo
    </Button>
  </Link>

  <Link href="/video_application">
    <Button className="w-full sm:w-auto text-gray-800 px-4 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
      Candidatures vidéo
    </Button>
  </Link>
</div>

  </div>

  {/* Search */}
  <div className="flex justify-center mb-6">
    <div className="relative w-full max-w-md sm:max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 py-2 sm:py-3 w-full border border-gray-300 rounded shadow-sm text-sm sm:text-base focus:ring-2 focus:ring-[#4d307c] focus:border-[#4d307c] transition"
      />
    </div>
  </div>

  {/* Video Jobs */}
  <div className="mt-6 sm:mt-10">
    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Offres Vidéo</h3>
    {videoJobs.length === 0 ? (
      <p className="text-gray-500 text-center">Aucune offre vidéo</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {videoJobs.map((videoJob) => (
          <Card key={videoJob.id} className="border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
                <div>
                  <CardTitle className="text-lg font-medium text-gray-800">{videoJob.title}</CardTitle>
                  <p className="text-sm text-gray-500">Offre vidéo</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="border border-gray-300 text-gray-700 bg-gray-100">{videoJob.location}</Badge>
                    <Badge className="border border-gray-300 text-gray-700 bg-gray-100">{videoJob.contract_type}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0 justify-start sm:justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => router.push(`/EditJobForm/${videoJob.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border border-gray-300 text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
                    onClick={() => handleDeleteVideoJob(videoJob.id, videoJob.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Cette offre est au format vidéo.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>

  {/* Jobs classiques */}
  {loading ? (
    <p className="text-gray-500 text-center">Chargement...</p>
  ) : filteredJobs.length === 0 ? (
    <p className="text-gray-500 text-center">Aucune offre trouvée</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {filteredJobs.map((job) => (
        <Card key={job.id} className="border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between items-start p-4 gap-2 sm:gap-0">
              {/* Infos Offre */}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">{job.title}</CardTitle>
                <div className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      job.is_valid ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                  >
                    {job.is_valid ? "Validée" : "Non validée"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="border border-gray-200 bg-gray-100 text-gray-700">{job.sector}</Badge>
                  <Badge className="border border-gray-200 bg-gray-100 text-gray-700">{job.location}</Badge>
                  <Badge className="border border-gray-200 bg-gray-100 text-gray-700">{job.type}</Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-2 sm:mt-0 justify-start sm:justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => { setEditingJob(job); setShowForm(true); }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border border-gray-300 text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
                  onClick={() => handleDeleteJob(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )}
</div>

  );
}

'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Briefcase, Users, TrendingUp, Euro, MapPin, Play, Send, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";

const Index = () => {
  const [listJob, setListJob] = useState<any[]>([]);
  const [listvideoJob, setListvideoJob] = useState<any[]>([]);
  const [idUser, setIdUser] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [inputSearch,setInputSearch]= useState<string>("")

  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setSlidesPerView(1);
      else if (window.innerWidth < 1024) setSlidesPerView(2);
      else setSlidesPerView(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function fetchUser() {
    const { data } = await supabase.auth.getUser();
    setIdUser(data.user?.id || null);
  }

  async function getJobs() {
    const { data, error } = await supabase.from("jobs").select().limit(3);
    if (error) return setListJob([]);
    setListJob(data || []);
  }

  async function fetchVideoJobs() {
    const { data, error } = await supabase.from("video_job").select().limit(6);
    if (error) return setListvideoJob([]);
    setListvideoJob(data || []);
  }

  useEffect(() => {
    getJobs();
    fetchVideoJobs();
    fetchUser();
  }, []);

  const prevSlide = () => {
    setCurrentIndex(prev =>
      prev === 0 ? Math.max(0, listvideoJob.length - slidesPerView) : prev - 1
    );
  };
  const nextSlide = () => {
    setCurrentIndex(prev =>
      prev >= listvideoJob.length - slidesPerView ? 0 : prev + 1
    );
  };

  const violet = "#4F46E5";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* HERO */}
<section className="
  pt-12 sm:pt-16
  flex flex-col justify-center items-center
  text-center
  min-h-[280px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[60vh]
">

  <div className="
    container mx-auto 
    flex flex-col items-center 
    mb-8 sm:mb-16 
    h-auto sm:h-[48vh] 
    justify-center
  ">

    {/* TITRES */}
<div className="flex flex-col items-center text-center mb-4 sm:mb-6 px-6 sm:px-0 max-w-[95%] mx-auto">
  <h1 className="
    text-[28px] sm:text-5xl md:text-6xl lg:text-[65px] 
    font-roboto font-bold
    leading-[34px] sm:leading-tight
  ">
    Trouvez votre prochain emploi
  </h1>

  <h1 className="
    text-[28px] sm:text-5xl md:text-6xl lg:text-[65px] 
    font-roboto font-bold 
    text-[#4d307cff] mt-2
    leading-[34px] sm:leading-tight
  ">
    rapidement et facilement
  </h1>
</div>


    {/* PARAGRAPHE */}
    <p className="
      text-[14px] sm:text-xl md:text-[21px]
      text-center 
      w-[92%] sm:w-4/5 md:w-3/5 lg:w-[40%]
      mx-auto 
      my-4 sm:my-10  
      font-medium 
      leading-[22px] sm:leading-relaxed
      text-gray-400
    ">
      Trouvez des offres qui vous correspondent et postulez simplement, sans perdre de temps.
    </p>

    {/* BARRE DE RECHERCHE */}
    <div className="relative w-[92%] sm:w-[600px] md:w-[730px]">
      <input
        type="text"
        placeholder="Quel job cherchez-vous ?"
        onChange={(e) => setInputSearch(e.target.value)}
        className="
          w-full 
          h-[46px] sm:h-[60px] md:h-[70px]
          text-[14px] sm:text-[16px] md:text-[18px]
          bg-white 
          rounded-[24px] sm:rounded-[40px]
          shadow-md 
          px-4 sm:px-6 
          pr-14 sm:pr-24
          border border-gray-100 
          placeholder-gray-400 
          focus:outline-none focus:ring-1 focus:ring-gray-200
        "
      />

      <Link href={`/offres?text=${encodeURIComponent(inputSearch)}`}>
        <button
          className="
            absolute right-2 top-1/2 -translate-y-1/2 
            bg-[#4d307c] text-white 
            rounded-full 
            h-10 w-10 sm:h-14 sm:w-14
            flex items-center justify-center 
            hover:bg-[#371f7a] hover:scale-105 
            transition-all duration-300
          "
        >
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      </Link>
    </div>

  </div>
</section>



        <div className="w-full flex justify-center items-center mb-4 h-[40px]">
          <div className="rounded-[50%] w-[13px] h-[13px] bg-[#70549c] m-[5px]"></div>
          <p className="font-medium text-gray-400">
            Sélection de nos offres phares
          </p>
        </div>

        {/* CARROUSEL VIDEO RESPONSIVE */}
{listvideoJob.length >= 3 && (
  <section className="w-full relative px-4 flex items-center justify-center">
    {/* Bouton précédent */}
    <button
      onClick={prevSlide}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full p-3 shadow-md hover:shadow-lg transition-shadow md:p-4 bg-white"
    >
      &#10094;
    </button>

    <div className="overflow-hidden w-full max-w-[1200px]">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)` }}
      >
        {listvideoJob.map((elem, index) => (
          <div key={elem.id} className="flex-shrink-0 px-2 w-[90%] sm:w-[380px] mx-auto">
            <div
              className="pt-8 rounded-2xl flex flex-col justify-start bg-white h-auto sm:h-[500px] transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02]"
              style={{ border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
                <video
                  ref={(el) => { if (el) videoRefs.current[index] = el; }}
                  src={elem.video_url}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => videoRefs.current[index]?.play()}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: "white", border: "none" }}
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="#27142d" stroke="none" />
                </button>
              </div>

              <div className="space-y-1 mb-4 ml-2 px-4 text-muted-foreground">
                <h3 className="text-lg sm:text-[23px] font-semibold text-black mt-6 sm:mt-8">
                  {elem.title}
                </h3>

                {elem.location && (
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="h-4 w-4" />
                    <span>{elem.location}</span>
                  </div>
                )}
                {elem.contract_type && (
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Briefcase className="h-4 w-4" />
                    <span>{elem.contract_type}</span>
                  </div>
                )}
                {elem.salary && (
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Euro className="h-4 w-4" />
                    <span>{elem.salary}</span>
                  </div>
                )}
              </div>

              <Link href={`/formVideo/${elem.id}`} className="flex items-center justify-center">
                <button
                  className="w-[90%] h-[45px] mx-auto mb-4 rounded-lg font-semibold text-white bg-[#4d307cff] hover:bg-[#371f7a] hover:scale-105 transition-transform duration-300"
                >
                  Postuler
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Bouton suivant */}
    <button
      onClick={nextSlide}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full p-3 shadow-md hover:shadow-lg transition-shadow md:p-4 bg-white"
    >
      &#10095;
    </button>
  </section>
)}


        {/* BOUTON VOIR TOUTES LES OFFRES */}
        <div className="flex justify-center items-center my-8 h-[70px]">
          <Link href="/offres">
            <Button
              size="lg"
              className="px-8 py-3 rounded-[30px] bg-[#4d307cff] text-white font-semibold h-[50px] w-[240px] hover:bg-[#371f7a] hover:scale-105 transition-all duration-300"
            >
              Voir toutes les offres <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* AVANTAGES */}
      <section className="py-20 px-4 bg-gray-50">
  <div className="container mx-auto flex flex-col items-center text-center">
    <h2 className="text-3xl sm:text-4xl font-bold mb-12" style={{ color: "bg-indigo-600" }}>
      Pourquoi choisir C'tonjob ?
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
      {[
        {
          Icon: Briefcase,
          title: "Des opportunités partout",
          text: "Accédez à des offres d'emploi dans tous les secteurs et toutes les régions.",
        },
        {
          Icon: MapPin,
          title: "Partout en France",
          text: "Trouvez facilement des missions proches de chez vous ou à distance.",
        },
        {
          Icon: Send,
          title: "Postulez rapidement",
          text: "Candidatez directement depuis notre plateforme en quelques clics.",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
        >
          <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-[#4d307cff] text-white group-hover:scale-110 transition-transform duration-300">
            <item.Icon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-[#4d307cff] transition-colors duration-300">
            {item.title}
          </h3>
          <p className="text-gray-600">{item.text}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="py-20 px-4 bg-gray-50">
  <div className="container mx-auto text-center">
    {/* Titre */}
    <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
      Postulez ou laissez les jobs venir à vous
    </h2>
    <p className="text-gray-600 text-lg sm:text-xl mb-12 max-w-2xl mx-auto">
      Vous pouvez soit postuler directement aux offres qui vous intéressent, soit déposer votre CV dans notre CV Tech pour être visible par les recruteurs.
    </p>

    {/* Les 2 options */}
    <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6">
      {/* Option 1: Postuler directement */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <Send className="mx-auto text-[#4d307cff] w-12 h-12 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Postuler directement</h3>
        <p className="text-gray-600">
          Parcourez les offres disponibles et candidatez rapidement à celles qui correspondent à vos compétences et vos préférences.
        </p>
        <Link href="/offres">
          <button className="mt-4 bg-[#4d307cff] hover:bg-[#371f7a] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300">
            Voir les offres
          </button>
        </Link>
      </div>

      {/* Option 2: Déposer son CV Tech */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <Users className="mx-auto text-[#4d307cff] w-12 h-12 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Déposer mon CV Tech</h3>
        <p className="text-gray-600">
          Déposez votre CV technique complet pour être visible auprès des recruteurs et recevoir directement des opportunités adaptées à votre profil.
        </p>
        <Link href="/auth?tab=signup">
          <button className="mt-4 bg-[#4d307cff] hover:bg-[#371f7a] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300">
            S’inscrire et déposer
          </button>
        </Link>
      </div>
    </div>
  </div>
</section>



      </main>

      <Footer />
    </div>
  );
};

export default Index;

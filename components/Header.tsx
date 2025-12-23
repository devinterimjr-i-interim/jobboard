'use client';

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Briefcase, LogOut, LayoutDashboard, Plus, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [isApprovedRecruiter, setIsApprovedRecruiter] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) checkRecruiterStatus();
    else setIsApprovedRecruiter(false);
  }, [user]);

  const checkRecruiterStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("recruiters")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsApprovedRecruiter(data?.status === "approved");
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      else Sentry.captureException(error);
      setIsApprovedRecruiter(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      else Sentry.captureException(error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between h-[70px]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity"
        >
          <Briefcase className="h-7 w-7 text-[#4d307cff]" />
          <span className="hidden sm:inline text-[#4d307cff]">C'tonJob</span>
        </Link>


        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-2 md:gap-3">
          <Link href="/offres">
            <Button
              variant="ghost"
              size="sm"
              className="font-semibold hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300"
            >
              Offres
            </Button>
          </Link>
          <Link href="/ListRecruiters">
            <Button
              variant="ghost"
              size="sm"
              className="font-semibold hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300"
            >
              Liste Recruteur
            </Button>
          </Link>
          <Link href="/RecruiterSpace">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex font-semibold hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300"
            >
              Recruteur
            </Button>
          </Link>

          {user ? (
            <>
              {isApprovedRecruiter && (
                <Link href="/PostJob">
                  <Button
                    size="sm"
                    className="hidden lg:inline-flex font-semibold bg-[#4d307cff] text-white hover:bg-[#371f7a] hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Publier
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link href="/DashboardJobs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:inline-flex font-semibold border border-[#4d307cff] text-[#4d307cff] hover:bg-[#4d307cff] hover:text-white hover:scale-105 transition-all duration-300"
                  >
                    <LayoutDashboard className="mr-1.5 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/candidateProfil">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-[#4d307cff]/10 transition-all duration-300"
                >
                  <User className="h-4 w-4 text-[#4d307cff]" />
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-[#ff4d4d]/10 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 text-[#ff4d4d]" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth?tab=signup">
                <Button
                  size="sm"
                  className="font-semibold text-black border border-gray-300 hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300"
                >
                  Inscription
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  size="sm"
                  className="font-semibold text-white bg-[#4d307cff] hover:bg-[#371f7a] hover:scale-105 transition-all duration-300"
                >
                  Connexion
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile navigation panel */}
      {menuOpen && (
        <div className="md:hidden bg-card/95 border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
          <Link href="/offres">
            <Button className="w-full text-left hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300">
              Offres
            </Button>
          </Link>
          <Link href="/ListRecruiters">
            <Button className="w-full text-left hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300">
              Liste Recruteur
            </Button>
          </Link>
          <Link href="/RecruiterSpace">
            <Button className="w-full text-left hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300">
              Recruteur
            </Button>
          </Link>

          {user ? (
            <>
              {isApprovedRecruiter && (
                <Link href="/PostJob">
                  <Button className="w-full text-left bg-[#4d307cff] text-white hover:bg-[#371f7a] hover:scale-105 transition-all duration-300">
                    Publier
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link href="/DashboardJobs">
                  <Button className="w-full text-left border border-[#4d307cff] text-[#4d307cff] hover:bg-[#4d307cff] hover:text-white hover:scale-105 transition-all duration-300">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/candidateProfil">
                <Button className="w-full text-left hover:bg-[#4d307cff]/10 transition-all duration-300">
                  Profil
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                className="w-full text-left hover:bg-[#ff4d4d]/10 transition-all duration-300"
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth?tab=signup">
                <Button className="w-full text-left hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300">
                  Inscription
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="w-full text-left hover:bg-[#4d307cff]/10 hover:text-[#4d307cff] transition-all duration-300">
                  Connexion
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

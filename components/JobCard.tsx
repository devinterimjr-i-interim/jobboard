import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Euro } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  sector: string;
  location: string;
  type: string;
  salary_range?: string;
  recruiters?: {
    logo_url?: string;
    company_name?: string;
  };
}

export const JobCard = ({ job }: { job: Job }) => {
  const violet = "#4d307cff";

  return (
   <Card
  className="transition-transform h-[350px] flex flex-col justify-center border border-gray-200 duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
>

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
              <CardTitle className="text-xl break-words" style={{ color: violet }}>
              {job.recruiters?.company_name}
            </CardTitle>
            <CardTitle className="text-xl break-words" style={{ color: violet }}>
              {job.title}
            </CardTitle>
            <Badge
              variant="secondary"
              className="mt-2"
              style={{ backgroundColor: "#E0E5FF", color: violet }}
            >
              {job.sector}
            </Badge>
          </div>
          {job.recruiters?.logo_url && (
            <div className="flex-shrink-0">
              <img
                src={job.recruiters.logo_url}
                alt={job.recruiters.company_name || "Logo entreprise"}
                className="h-12 w-12 object-contain rounded transition-transform duration-300 hover:scale-110"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" style={{ color: violet }} />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" style={{ color: violet }} />
            <span>{job.type}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Euro className="h-4 w-4" style={{ color: violet }} />
              <span>{job.salary_range}</span>
            </div>
          )}
        </div>
        <Link href={`/offres/${job.id}`}>
          <Button
            className="w-full transition-all duration-300 hover:scale-105 hover:bg-[#371f7a]"
            style={{
              backgroundColor: violet,
              color: "white",
              borderColor: violet,
            }}
          >
            Voir l'offre
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

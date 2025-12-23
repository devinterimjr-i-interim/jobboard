import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Contact / Infos */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
          
          {/* Logo / Branding */}
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">PopupJob</h2>
            <p className="text-sm text-gray-600">Le jobboard qui simplifie vos recrutements et vos candidatures</p>
          </div>

          {/* Coordonnées */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="h-5 w-5 text-primary" />
              <span>contact@nextJob.fr</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="h-5 w-5 text-primary" />
              <span>01 23 45 67 89</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Paris, France</span>
            </div>
          </div>
        </div>

        {/* Liens légaux */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4 md:gap-0">
          <span>© 2025 PopupJob. Tous droits réservés.</span>
          <div className="flex gap-4">
           <Link href="/privacy" className="hover:text-gray-900 underline">Politique de confidentialité</Link>
           <Link href="/cgu" className="hover:text-gray-900 underline">CGU</Link>
           <Link href="/mentionsLegales" className="hover:text-gray-900 underline">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

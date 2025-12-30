// app/recruiter-confirm/page.tsx

import RecruiterConfirmClient from "./RecruiterConfirmClient";

export const dynamic = "force-dynamic"; // désactive le prerender, rendu uniquement client

export default function Page() {
  return <RecruiterConfirmClient />;
}

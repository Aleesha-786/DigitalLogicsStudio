import { Navigate, useParams } from "react-router-dom";
import TheoryHomePage from "./TheoryHomePage";
import { TRACKS } from "./tracks";

// Registered at "/:track?" (preserving the legacy param-based
// route) so "", "/dld" both render the DLD home
// page, "/coal" redirects to its own static route, and any
// other value falls back to "/dld".
export default function DldHomeRoute() {
  const { track } = useParams();

  if (track === "coal") return <Navigate to="/coal" replace />;
  if (track && track !== "dld") return <Navigate to="/dld" replace />;

  return <TheoryHomePage track={TRACKS.dld} />;
}

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Wraps ProtectedRoute with a role check. Unauthenticated users get the
 * normal ProtectedRoute -> /login redirect; authenticated users whose role
 * isn't in `roles` are bounced to `redirectTo` instead of seeing the page.
 *
 * Usage:
 *   <Route
 *     path="/problems/editor/:problemId"
 *     element={
 *       <RoleProtectedRoute roles={["instructor", "admin"]}>
 *         <ProblemEditorPage />
 *       </RoleProtectedRoute>
 *     }
 *   />
 */
export default function RoleProtectedRoute({ children, roles, redirectTo = "/problems" }) {
  return (
    <ProtectedRoute>
      <RoleGate roles={roles} redirectTo={redirectTo}>
        {children}
      </RoleGate>
    </ProtectedRoute>
  );
}

function RoleGate({ children, roles, redirectTo }) {
  const { user } = useAuth();
  const location = useLocation();

  const allowed = !roles || roles.length === 0 || roles.includes(user?.role);

  if (!allowed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}

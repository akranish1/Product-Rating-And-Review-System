import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearClientAuth, fetchCurrentUser, getStoredUser } from "../lib/auth";

const ProtectedRoute = () => {
  const location = useLocation();
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    let isActive = true;

    const verifySession = async () => {
      const result = await fetchCurrentUser();

      if (!isActive) {
        return;
      }

      if (result.ok) {
        setUser(result.user);
        setStatus("authorized");
      } else {
        clearClientAuth();
        setUser(null);
        setStatus("unauthorized");
      }
    };

    verifySession();

    return () => {
      isActive = false;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">
            Session Check
          </p>
          <p className="mt-3 text-base text-slate-200">
            Verifying your account access...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized" || !user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

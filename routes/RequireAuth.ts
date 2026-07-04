// src/routes/RequireAuth.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authUserOrNull } from "../libs/auth";

export default function RequireAuth() {
  const location = useLocation();
  const user = authUserOrNull();

  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}

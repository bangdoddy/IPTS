// src/routes/Protected.tsx (atau lokasi file kamu sekarang)
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authUserOrNull } from "../libs/auth"; // sesuaikan path: ../libs/auth atau ../lib/auth

type ProtectedProps = {
  children: React.ReactNode;
};

export function Protected({ children }: ProtectedProps) {
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

  return <>{children}</>;
}

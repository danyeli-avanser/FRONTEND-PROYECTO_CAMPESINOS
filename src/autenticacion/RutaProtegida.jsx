import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RutaProtegida() {
  const location = useLocation();

  const token = localStorage.getItem("token_campesena"); // ✅ ESTE ES EL IMPORTANTE
  const userRaw = localStorage.getItem("usuario");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // si no hay token -> login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // si hay token pero no hay usuario, igual deja pasar (por MVP)
  return <Outlet />;
}

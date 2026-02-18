// src/autenticacion/RutaConRol.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function getUser() {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function homeByRole(role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "CAMPESINO") return "/campesino/dashboard";
  if (role === "ASOCIACION") return "/asociacion/dashboard";
  if (role === "GESTOR") return "/gestor/dashboard";
  return "/login";
}

export default function RutaConRol({ rolesPermitidos = [] }) {
  const location = useLocation();
  const token = localStorage.getItem("token_campesena");
  const user = getUser();

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;

  const role = user?.role || "";
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(role)) {
    return <Navigate to={homeByRole(role)} replace />;
  }

  return <Outlet />;
}

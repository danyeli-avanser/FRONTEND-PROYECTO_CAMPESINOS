// src/componentes/layout/BarraNavegacion.jsx
import React from "react";
import Notificaciones from "./Notificaciones";

function getUser() {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function labelRole(role) {
  if (role === "ADMIN") return "ADMIN CAMPESEÑA";
  if (role === "CAMPESINO") return "CAMPESINO";
  if (role === "ASOCIACION") return "ASOCIACIÓN";
  if (role === "GESTOR") return "GESTOR";
  return "USUARIO";
}

export default function BarraNavegacion() {
  const user = getUser();
  const role = user?.role || "";
  const name = user?.name || "Usuario";
  const initial = (name?.trim()?.[0] || "U").toUpperCase();

  return (
    <nav className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-[#042b18] font-black tracking-tight text-lg uppercase">
          Sistema de Gestión
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <Notificaciones />

        <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
          <div className="text-right">
            <p className="text-xs font-black text-[#042b18] uppercase tracking-tighter">
              {labelRole(role)}
            </p>
            <p className="text-[10px] font-bold text-[#39a900]">
              {name}
            </p>
          </div>

          <div className="w-10 h-10 bg-[#39a900] rounded-full flex items-center justify-center text-white shadow-lg">
            <span className="font-bold">{initial}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

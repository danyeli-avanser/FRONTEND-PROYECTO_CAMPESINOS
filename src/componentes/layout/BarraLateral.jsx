// src/componentes/layout/BarraLateral.jsx
import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  PlusCircle,
  Clock
} from "lucide-react";

function getUser() {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function sidebarByRole(role) {
  if (role === "CAMPESINO") {
    return [
      { to: "/campesino/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
      { to: "/campesino/nueva-solicitud", label: "Nueva Solicitud", icon: <PlusCircle size={20} /> },
      { to: "/campesino/seguimiento", label: "Mis Solicitudes", icon: <Clock size={20} /> },
    ];
  }

  // ADMIN (por ahora)
  return [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/solicitudes", label: "Solicitudes", icon: <FileText size={20} /> },
    { to: "/admin/usuarios", label: "Usuarios", icon: <Users size={20} /> },
    { to: "/admin/configuracion", label: "Configuración", icon: <Settings size={20} /> },
  ];
}

export default function BarraLateral() {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role || "";
  const name = user?.name || "Usuario";
  const initial = (name?.trim()?.[0] || "U").toUpperCase();

  const items = useMemo(() => sidebarByRole(role), [role]);

  const handleCerrarSesion = () => {
    localStorage.removeItem("token_campesena");
    localStorage.removeItem("refresh");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-64 bg-[#052e16] text-white flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
          <span className="text-[#052e16] font-bold text-xl italic">S</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">CampeSENA</h1>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-[#39a900] text-white" : "hover:bg-[#1a3d21] text-gray-300"
              }`
            }
          >
            {it.icon}
            <span className="font-medium text-sm">{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1a3d21] bg-[#042612]">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 bg-[#39a900] rounded-full flex items-center justify-center font-bold text-white shadow-md">
            {initial}
          </div>
          <div className="text-sm">
            <p className="font-bold text-[13px]">{name}</p>
            <p className="text-[10px] text-gray-400 uppercase font-black">{role || "ROL"}</p>
          </div>
        </div>

        <button
          onClick={handleCerrarSesion}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-red-400 hover:bg-red-900/20 rounded-xl transition-all font-bold text-xs"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

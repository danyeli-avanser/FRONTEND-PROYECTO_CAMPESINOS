import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Contexto y Seguridad
import { AuthProvider } from "./contexto/ContextoAutenticacion";
import IniciarSesion from "./autenticacion/IniciarSesion";
import RutaProtegida from "./autenticacion/RutaProtegida";
import RutaConRol from "./autenticacion/RutaConRol";

// Layout base
import ContenedorPagina from "./componentes/layout/ContenedorPagina";

// Vistas de ADMINISTRADOR
import PanelAdministrador from "./paginas/administrador/PanelAdministrador";
import Solicitudes from "./paginas/administrador/Solicitudes";
import RolesPermisos from "./paginas/administrador/RolesPermisos";
import Auditoria from "./paginas/administrador/Auditoria";
import ConfiguracionSistema from "./paginas/administrador/ConfiguracionSistema"; // Para Documentos
import FormulariosDinamicos from "./paginas/administrador/FormulariosDinamicos"; // Para Formularios
import UsuariosAdmin from "./componentes/Admin/UsuariosAdmin";
import DetalleSolicitud from "./paginas/administrador/DetalleSolicitud";

// Vistas de CAMPESINO
import PanelCampesino from "./paginas/campesino/PanelCampesino";
import NuevaSolicitud from "./paginas/campesino/NuevaSolicitud";
import SeguimientoSolicitud from "./paginas/campesino/SeguimientoSolicitud";
import DetalleSolicitudCampesino from "./paginas/campesino/DetalleSolicitudCampesino";

function App() {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const handleNotificacion = (event) => {
      setNotificaciones((prev) => [event.detail, ...prev]);
    };
    window.addEventListener("nueva-notificacion", handleNotificacion);
    return () => window.removeEventListener("nueva-notificacion", handleNotificacion);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 1. RUTA PÚBLICA */}
          <Route path="/login" element={<IniciarSesion />} />

          {/* 2. RUTAS PRIVADAS */}
          <Route element={<RutaProtegida />}>

            {/* SECCIÓN ADMINISTRADOR */}
            <Route element={<RutaConRol rolesPermitidos={["ADMIN"]} />}>
              <Route path="/admin" element={<ContenedorPagina notificaciones={notificaciones} />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PanelAdministrador />} />
                <Route path="solicitudes" element={<Solicitudes />} />
                <Route path="solicitudes/:id" element={<DetalleSolicitud />} />
                <Route path="roles-permisos" element={<RolesPermisos />} />
                <Route path="auditoria" element={<Auditoria />} />
                <Route path="usuarios" element={<UsuariosAdmin />} />

                {/* --- GRUPO DE CONFIGURACIÓN --- */}
                <Route path="configuracion">
                  {/* Redirección por defecto al entrar a la sección */}
                  <Route index element={<Navigate to="documentos" replace />} />
                  
                  {/* RUTA PARA DOCUMENTOS */}
                  <Route path="documentos" element={<ConfiguracionSistema />} />
                  
                  {/* RUTA PARA FORMULARIOS (Usando su componente propio) */}
                  <Route path="formularios" element={<FormulariosDinamicos />} />
                </Route>
              </Route>
            </Route>

            {/* SECCIÓN CAMPESINO */}
            <Route element={<RutaConRol rolesPermitidos={["CAMPESINO"]} />}>
              <Route path="/campesino" element={<ContenedorPagina notificaciones={notificaciones} />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PanelCampesino />} />
                <Route path="nueva-solicitud" element={<NuevaSolicitud />} />
                <Route path="seguimiento" element={<SeguimientoSolicitud />} />
                <Route path="solicitudes/:id" element={<DetalleSolicitudCampesino />} />
              </Route>
            </Route>

          </Route>

          {/* 3. MANEJO DE RUTAS NO ENCONTRADAS */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
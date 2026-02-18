// src/contexto/ContextoAutenticacion.jsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  // hidratar sesión si recargan la página
  useEffect(() => {
    const raw = localStorage.getItem("usuario");
    if (raw) {
      try {
        setUsuario(JSON.parse(raw));
      } catch {
        // si está corrupto, limpiamos
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  const cerrarSesion = () => {
    // 1. Limpiar localStorage
    localStorage.removeItem("token_campesena");
    localStorage.removeItem("refresh");
    localStorage.removeItem("usuario");
    // 2. Limpiar estado
    setUsuario(null);
    // 3. Redirigir al login (FORZADO)
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
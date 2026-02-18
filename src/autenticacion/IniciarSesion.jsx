import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

import { login as loginApi } from "../api/auth";

const IniciarSesion = () => {
  const [identificacion, setIdentificacion] = useState("");
  const [password, setPassword] = useState("");
  const [documentType, setDocumentType] = useState("CC");
  const [error, setError] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const data = await loginApi({
        document_type: documentType,
        document_number: identificacion.trim(),
        password,
      });

      // ✅ Convención ÚNICA (web y móvil):
      // - token_campesena = access
      // - refresh = refresh
      // - usuario = user
      localStorage.setItem("token_campesena", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // limpiar llaves viejas (evita bugs por desorden)
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("access");

      const role = data?.user?.role;

      if (role === "ADMIN") navigate("/admin/dashboard");
      // temporal mientras no exista módulo gestor:
      else if (role === "GESTOR") navigate("/admin/dashboard");
      // temporal mientras no exista módulo asociación:
      else if (role === "ASOCIACION") navigate("/campesino/dashboard");
      else navigate("/campesino/dashboard");
    } catch (err) {
      const detail = err?.response?.data?.detail;

      // soporta string o lista
      const msg = Array.isArray(detail)
        ? detail[0]
        : detail || "Credenciales inválidas.";

      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-[#052e16] p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-xl mx-auto flex items-center justify-center mb-4">
            <span className="text-[#052e16] text-3xl font-bold">S</span>
          </div>
          <h2 className="text-white text-2xl font-bold italic">CampeSENA</h2>
          <p className="text-gray-300 text-sm mt-2">
            Acceso con Documento de Identidad
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de documento
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#39a900] focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="CC">CC</option>
              <option value="NIT">NIT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Identificación
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                required
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#39a900] focus:border-transparent outline-none transition-all"
                placeholder="Ingrese su documento"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={mostrarPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#39a900] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-[#39a900]"
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#39a900] hover:bg-[#2e8800] text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-70 active:scale-[0.98]"
          >
            {cargando ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Iniciando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IniciarSesion;

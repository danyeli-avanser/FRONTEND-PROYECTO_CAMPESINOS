// src/paginas/campesino/SeguimientoSolicitud.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listSolicitudes } from "../../api/solicitudes.api";

const mapEstado = (st) =>
  ({
    BORRADOR: "Borrador",
    REGISTRADA: "Registrada",
    EN_REVISION: "En revisión",
    EN_AJUSTES: "En ajustes",
    VALIDADA: "Validada",
    VALIDADA_PARA_ENVIO: "Validada para envío",
  }[st] || st);

export default function SeguimientoSolicitud() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        const res = await listSolicitudes({ page: 1, mias: true });
        setRows(res?.results || []);
      } catch (e) {
        setError(e?.response?.data?.detail || "No se pudieron cargar tus solicitudes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const id = String(r.id ?? "").toLowerCase();
      const tipo = String(r.request_type ?? "").toLowerCase();
      const estado = String(r.status ?? "").toLowerCase();
      return id.includes(q) || tipo.includes(q) || estado.includes(q);
    });
  }, [rows, busqueda]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Solicitudes</h1>
          <p className="text-gray-500 text-sm">Seguimiento en tiempo real</p>
        </div>

        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white">
          <Search size={18} className="text-gray-400" />
          <input
            className="outline-none text-sm w-64"
            placeholder="Buscar por id, tipo o estado…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      {loading && <div className="text-gray-500">Cargando…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-500 bg-gray-50">
            <div className="col-span-2">ID</div>
            <div className="col-span-3">Tipo</div>
            <div className="col-span-3">Estado</div>
            <div className="col-span-3">Actualizada</div>
            <div className="col-span-1 text-right">Ver</div>
          </div>

          {filtradas.length === 0 ? (
            <div className="p-4 text-gray-500">No tienes solicitudes aún.</div>
          ) : (
            filtradas.map((r) => (
              <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm items-center">
                <div className="col-span-2 font-semibold">#{r.id}</div>
                <div className="col-span-3">{r.request_type}</div>
                <div className="col-span-3">{mapEstado(r.status)}</div>
                <div className="col-span-3">
                  {r.updated_at ? new Date(r.updated_at).toLocaleString() : "-"}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    className="inline-flex items-center gap-2 text-[#39a900] font-bold hover:underline"
                    onClick={() => navigate(`/campesino/solicitudes/${r.id}`)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

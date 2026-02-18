import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ NUEVO
import {
  Search,
  Download,
  MoreHorizontal,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { listSolicitudes } from "../../api/solicitudes.api";

const Solicitudes = () => {
  const navigate = useNavigate(); // ✅ NUEVO

  // filtros UI
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos los estados");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  // data real
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const load = async (p = 1) => {
    setError("");
    setLoading(true);
    try {
      const res = await listSolicitudes({ page: p });
      setData(res);
      setPage(p);
    } catch (e) {
      setError(e?.response?.data?.detail || "No se pudo cargar solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers
  const mapTipo = (rt) =>
    rt === "CAPACITACION"
      ? "Capacitacion"
      : rt === "PROYECTO_PRODUCTIVO"
      ? "Proyecto"
      : rt;

  const mapEstado = (st) =>
    ({
      BORRADOR: "Borrador",
      REGISTRADA: "Registrada",
      EN_REVISION: "En revision",
      EN_AJUSTES: "En ajustes",
      VALIDADA: "Validada",
      VALIDADA_PARA_ENVIO: "Validada para envio",
    }[st] || st);

  // Normaliza cada caso
  const rows = useMemo(() => {
    return (data?.results || []).map((c) => ({
      id: c.id,
      numero: c.code || `SOL-${String(c.id).padStart(4, "0")}`,
      solicitante:
        c?.created_by?.email ||
        c?.created_by?.name ||
        c?.created_by?.first_name ||
        "Solicitante",
      tipoUsuario: c.applicant_type === "ASOCIACION" ? "Asociacion" : "Campesino",
      tipo: mapTipo(c.request_type),
      ubicacion: c?.data?.municipio
        ? `${c.data.municipio}, Colombia`
        : "Sin municipio, Colombia",
      fecha: (c.created_at || "").slice(0, 10) || "",
      prioridad: "Media", // MVP
      estado: mapEstado(c.status),
      gestor: c?.assigned_to?.email || "Sin asignar",
    }));
  }, [data]);

  // filtro local
  const solicitudesFiltradas = useMemo(() => {
    return rows.filter((sol) => {
      const cumpleBusqueda =
        sol.solicitante.toLowerCase().includes(busqueda.toLowerCase()) ||
        sol.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        sol.ubicacion.toLowerCase().includes(busqueda.toLowerCase());

      const cumpleEstado =
        filtroEstado === "Todos los estados" || sol.estado === filtroEstado;

      const cumpleTipo = filtroTipo === "Todos" || sol.tipo === filtroTipo;

      return cumpleBusqueda && cumpleEstado && cumpleTipo;
    });
  }, [busqueda, filtroEstado, filtroTipo, rows]);

  // export CSV
  const exportarData = () => {
    const encabezados =
      "Numero,Solicitante,Tipo,Ubicacion,Fecha,Prioridad,Estado,Gestor\n";
    const filas = solicitudesFiltradas
      .map(
        (s) =>
          `${s.numero},${s.solicitante},${s.tipo},${s.ubicacion},${s.fecha},${s.prioridad},${s.estado},${s.gestor}`
      )
      .join("\n");
    const blob = new Blob([encabezados + filas], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_Solicitudes_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  // stats (solo página actual)
  const statsBase = rows;

  const goToDetail = (id) => {
    navigate(`/admin/solicitudes/${id}`); // ✅ NUEVO
  };

  return (
    <div className="p-8 bg-[#f8faf8] min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Solicitudes
          </h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Gestión de solicitudes de campesinos y asociaciones
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-300" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs outline-none w-64 shadow-sm"
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="relative p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#39a900] text-white text-[10px] flex items-center justify-center rounded-full font-black">
              3
            </span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatCard label="En esta página" value={statsBase.length} />
        <StatCard
          label="Registradas"
          value={statsBase.filter((s) => s.estado === "Registrada").length}
        />
        <StatCard
          label="En Revision"
          value={statsBase.filter((s) => s.estado === "En revision").length}
        />
        <StatCard
          label="En Ajustes"
          value={statsBase.filter((s) => s.estado === "En ajustes").length}
          color="text-red-500"
        />
        <StatCard
          label="Validadas"
          value={statsBase.filter((s) => s.estado.includes("Validada")).length}
          color="text-[#39a900]"
        />
      </div>

      {/* FILTROS */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-300" size={14} />
            <input
              type="text"
              placeholder="Buscar por numero, solicitante o municipio..."
              className="pl-9 pr-4 py-2 bg-[#f8faf8] border-none rounded-xl text-[11px] w-72 outline-none focus:ring-1 focus:ring-[#39a900]"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="bg-[#f8faf8] border-none rounded-xl px-4 py-2 text-[11px] font-bold text-gray-500 outline-none cursor-pointer"
            onChange={(e) => setFiltroEstado(e.target.value)}
            value={filtroEstado}
          >
            <option value="Todos los estados">Todos los estados</option>
            <option value="Borrador">Borrador</option>
            <option value="Registrada">Registrada</option>
            <option value="En revision">En revisión</option>
            <option value="En ajustes">En ajustes</option>
            <option value="Validada">Validada</option>
            <option value="Validada para envio">Validada para envío</option>
          </select>

          <select
            className="bg-[#f8faf8] border-none rounded-xl px-4 py-2 text-[11px] font-bold text-gray-500 outline-none cursor-pointer"
            onChange={(e) => setFiltroTipo(e.target.value)}
            value={filtroTipo}
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Capacitacion">Capacitación</option>
            <option value="Proyecto">Proyecto</option>
          </select>
        </div>

        <button
          onClick={exportarData}
          className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-600 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
        >
          <Download size={14} /> Exportar
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {error && (
          <div className="p-5 text-[11px] font-bold text-red-500 border-b border-gray-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-gray-400 font-bold text-sm">Cargando...</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="p-5">Numero</th>
                  <th className="p-5">Solicitante</th>
                  <th className="p-5">Tipo</th>
                  <th className="p-5">Ubicacion</th>
                  <th className="p-5">Fecha</th>
                  <th className="p-5">Prioridad</th>
                  <th className="p-5">Estado</th>
                  <th className="p-5 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {solicitudesFiltradas.map((sol) => (
                  <tr
                    key={sol.id}
                    className="hover:bg-gray-50/30 transition-colors group cursor-pointer"
                    onClick={() => goToDetail(sol.id)} // ✅ NUEVO
                  >
                    <td className="p-5 text-[11px] font-black text-gray-800">
                      {sol.numero}
                    </td>

                    <td className="p-5">
                      <p className="text-[11px] font-black text-gray-800 leading-none">
                        {sol.solicitante}
                      </p>
                      <span className="text-[8px] font-black text-gray-400 uppercase border border-gray-200 px-1.5 rounded mt-1.5 inline-block bg-white">
                        {sol.tipoUsuario}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${
                            sol.tipo === "Proyecto"
                              ? "bg-purple-50 text-purple-400"
                              : "bg-orange-50 text-orange-400"
                          }`}
                        >
                          <FileText size={12} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">
                          {sol.tipo}
                        </span>
                      </div>
                    </td>

                    <td className="p-5">
                      <p className="text-[11px] font-bold text-gray-800 leading-none">
                        {sol.ubicacion.split(",")[0]}
                      </p>
                      <p className="text-[9px] text-gray-400">
                        {sol.ubicacion.split(",")[1]}
                      </p>
                    </td>

                    <td className="p-5 text-[11px] font-bold text-gray-400">
                      {sol.fecha}
                    </td>

                    <td className="p-5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-orange-50 text-orange-500">
                        {sol.prioridad}
                      </span>
                    </td>

                    <td className="p-5">
                      <StatusBadge status={sol.estado} />
                    </td>

                    <td className="p-5 text-right">
                      <button
                        className="p-2 hover:bg-white rounded-lg transition-all text-gray-300 hover:text-[#39a900] shadow-none hover:shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation(); // ✅ NUEVO: evita navegar al detalle
                          // aquí luego ponemos menú (asignar gestor / cambiar estado)
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {solicitudesFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-10 text-center text-gray-400 font-bold text-sm"
                    >
                      No hay solicitudes con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINACIÓN */}
            <div className="p-5 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                Mostrando {solicitudesFiltradas.length} de {data.count} solicitudes
              </p>

              <div className="flex gap-2">
                <button
                  className="px-4 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 flex items-center gap-1 disabled:opacity-50"
                  disabled={!data.previous}
                  onClick={() => load(page - 1)}
                >
                  <ChevronLeft size={14} /> Anterior
                </button>

                <button
                  className="px-4 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-800 flex items-center gap-1 disabled:opacity-50"
                  disabled={!data.next}
                  onClick={() => load(page + 1)}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// SUBCOMPONENTES
const StatCard = ({ label, value, color = "text-gray-800" }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest group-hover:text-[#39a900] transition-colors">
      {label}
    </p>
    <p className={`text-4xl font-black ${color} tracking-tighter leading-none`}>
      {value}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Borrador: "bg-gray-100 text-gray-500 border-gray-200",
    Registrada: "bg-gray-100 text-gray-500 border-gray-200",
    "En revision": "bg-blue-50 text-blue-500 border-blue-100",
    "En ajustes": "bg-red-50 text-red-400 border-red-100",
    Validada: "bg-green-50 text-green-500 border-green-100",
    "Validada para envio": "bg-[#39a900] text-white border-[#39a900]",
  };

  return (
    <div
      className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-tight flex items-center gap-1.5 w-fit ${
        styles[status] || "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {status === "Validada para envio" && (
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" />
      )}
      {status}
    </div>
  );
};

export default Solicitudes;

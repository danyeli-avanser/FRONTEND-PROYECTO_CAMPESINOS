import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, FileJson, User2, Save, FolderOpen } from "lucide-react";

import {
  getSolicitud,
  getSolicitudTimeline,
  updateSolicitud,
} from "../../api/solicitudes.api";

import { listDocumentos } from "../../api/documentos.api";

const mapEstado = (st) =>
  ({
    BORRADOR: "Borrador",
    REGISTRADA: "Registrada",
    EN_REVISION: "En revisión",
    EN_AJUSTES: "En ajustes",
    VALIDADA: "Validada",
    VALIDADA_PARA_ENVIO: "Validada para envío",
  }[st] || st);

const mapTipo = (rt) =>
  rt === "CAPACITACION"
    ? "Capacitación"
    : rt === "PROYECTO_PRODUCTIVO"
    ? "Proyecto"
    : rt;

export default function DetalleSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [solicitud, setSolicitud] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [documentos, setDocumentos] = useState([]);

  // Gestión de estado
  const [statusValue, setStatusValue] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusErr, setStatusErr] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [s, t, docs] = await Promise.all([
        getSolicitud(id),
        getSolicitudTimeline(id),
        listDocumentos(id),
      ]);

      setSolicitud(s);
      setStatusValue(s?.status || "");
      setTimeline(Array.isArray(t) ? t : []);
      setDocumentos(docs?.results || []);
    } catch (e) {
      setError(e?.response?.data?.detail || "No se pudo cargar el detalle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const header = useMemo(() => {
    if (!solicitud) return null;
    return {
      numero: solicitud.code || `SOL-${String(solicitud.id).padStart(4, "0")}`,
      estado: mapEstado(solicitud.status),
      tipo: mapTipo(solicitud.request_type),
      solicitante:
        solicitud?.created_by?.email ||
        solicitud?.created_by?.first_name ||
        "Solicitante",
      gestor: solicitud?.assigned_to?.email || "Sin asignar",
      fecha: (solicitud.created_at || "").slice(0, 10),
    };
  }, [solicitud]);

  const guardarEstado = async () => {
    setSavingStatus(true);
    setStatusMsg("");
    setStatusErr("");

    try {
      await updateSolicitud(id, { status: statusValue });

      // recargar para ver estado real + timeline actualizado
      await load();
      setStatusMsg("✅ Estado actualizado");
    } catch (e) {
      const d = e?.response?.data;
      setStatusErr(
        d?.detail ||
          (typeof d === "object"
            ? JSON.stringify(d, null, 2)
            : "No se pudo actualizar el estado.")
      );
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400 font-bold">Cargando detalle...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button
          className="mb-4 flex items-center gap-2 text-sm font-black text-gray-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (!solicitud) return null;

  return (
    <div className="p-8 bg-[#f8faf8] min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 text-sm font-black text-gray-600 hover:text-[#39a900]"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase">
            ID interno: {solicitud.id}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              {header.numero}
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {header.tipo} • {header.estado}
            </p>
          </div>

          <div className="flex gap-3">
            <Badge label="Estado" value={header.estado} />
            <Badge label="Tipo" value={header.tipo} />
            <Badge label="Fecha" value={header.fecha || "-"} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <InfoCard
            icon={<User2 size={18} />}
            label="Solicitante"
            value={header.solicitante}
          />
          <InfoCard
            icon={<User2 size={18} />}
            label="Gestor"
            value={header.gestor}
          />
          <InfoCard
            icon={<Clock size={18} />}
            label="Actualizada"
            value={(solicitud.updated_at || "")
              .slice(0, 19)
              .replace("T", " ") || "-"}
          />
        </div>
      </div>

      {/* Gestión de estado + Documentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gestión de estado */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Save size={18} className="text-gray-400" />
            <h2 className="text-sm font-black text-gray-700">
              Gestión de estado
            </h2>
          </div>

          <div className="p-5 space-y-3">
            {statusMsg && (
              <div className="text-green-700 font-bold text-sm">{statusMsg}</div>
            )}
            {statusErr && (
              <div className="text-red-600 font-bold text-sm whitespace-pre-wrap">
                {statusErr}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <select
                className="border border-gray-200 rounded-xl p-2 text-sm font-bold bg-white"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
              >
                <option value="BORRADOR">BORRADOR</option>
                <option value="REGISTRADA">REGISTRADA</option>
                <option value="EN_REVISION">EN_REVISION</option>
                <option value="EN_AJUSTES">EN_AJUSTES</option>
                <option value="VALIDADA">VALIDADA</option>
                <option value="VALIDADA_PARA_ENVIO">VALIDADA_PARA_ENVIO</option>
              </select>

              <button
                className="px-4 py-2 rounded-xl bg-[#39a900] text-white font-black text-sm flex items-center gap-2 hover:bg-[#2e8800] transition"
                onClick={guardarEstado}
                disabled={savingStatus}
              >
                <Save size={16} />
                {savingStatus ? "Guardando..." : "Guardar"}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 font-bold">
              * Esto cambiará el estado visible para el campesino en “Mis
              Solicitudes”.
            </p>
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <FolderOpen size={18} className="text-gray-400" />
            <h2 className="text-sm font-black text-gray-700">Documentos</h2>
          </div>

          <div className="p-5 space-y-3">
            {documentos.length === 0 ? (
              <p className="text-gray-400 font-bold text-sm">
                No hay documentos.
              </p>
            ) : (
              documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11px] font-black text-gray-800 uppercase">
                      {doc.category}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#39a900] font-black text-sm hover:underline"
                  >
                    Ver
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON data */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <FileJson size={18} className="text-gray-400" />
            <h2 className="text-sm font-black text-gray-700">
              Datos de la solicitud (JSON)
            </h2>
          </div>
          <div className="p-5">
            <pre className="text-[11px] leading-5 bg-[#f8faf8] border border-gray-100 rounded-xl p-4 overflow-auto">
{JSON.stringify(solicitud.data || {}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            <h2 className="text-sm font-black text-gray-700">
              Timeline (Auditoría)
            </h2>
          </div>

          <div className="p-5 space-y-3">
            {timeline.length === 0 ? (
              <p className="text-gray-400 font-bold text-sm">Sin eventos.</p>
            ) : (
              timeline.map((ev) => (
                <div
                  key={ev.id || `${ev.created_at}-${ev.event_type}`}
                  className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50/40 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black text-gray-800 uppercase">
                      {ev.event_type}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {(ev.created_at || "").slice(0, 19).replace("T", " ")}
                    </p>
                  </div>

                  <div className="mt-2 text-[11px] text-gray-600 font-bold">
                    <p>
                      <span className="text-gray-400">De:</span>{" "}
                      {mapEstado(ev.from_status) || "-"}
                      {"  "}→{"  "}
                      <span className="text-gray-400">A:</span>{" "}
                      {mapEstado(ev.to_status) || "-"}
                    </p>
                  </div>

                  {ev.payload && (
                    <pre className="mt-3 text-[11px] leading-5 bg-[#f8faf8] border border-gray-100 rounded-xl p-3 overflow-auto">
{JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="px-4 py-2 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
      <p className="text-[11px] font-black text-gray-800">{value}</p>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
      <div className="p-2 rounded-xl bg-[#f8faf8] border border-gray-100 text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase">
          {label}
        </p>
        <p className="text-[12px] font-black text-gray-800 mt-1 break-all">
          {value}
        </p>
      </div>
    </div>
  );
}

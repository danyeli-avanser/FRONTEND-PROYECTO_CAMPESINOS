import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getSolicitud, getSolicitudTimeline } from "../../api/solicitudes.api";
import { listDocumentos } from "../../api/documentos.api";

const estadoUI = (st) => {
  const map = {
    BORRADOR: { label: "Borrador", cls: "bg-gray-100 text-gray-700 border-gray-200" },
    REGISTRADA: { label: "Registrada", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    EN_REVISION: { label: "En revisión", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    EN_AJUSTES: { label: "En ajustes", cls: "bg-orange-50 text-orange-700 border-orange-200" },
    VALIDADA: { label: "Validada", cls: "bg-green-50 text-green-700 border-green-200" },
    VALIDADA_PARA_ENVIO: { label: "Validada para envío", cls: "bg-green-100 text-green-800 border-green-200" },
  };
  return map[st] || { label: st || "—", cls: "bg-gray-50 text-gray-700 border-gray-200" };
};

export default function DetalleSolicitudCampesino() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [solicitud, setSolicitud] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const s = await getSolicitud(id);
        setSolicitud(s);

        const tl = await getSolicitudTimeline(id);
        setTimeline(Array.isArray(tl) ? tl : []);

        const docs = await listDocumentos(id);
        setDocumentos(docs?.results || []);
      } catch (e) {
        setError(e?.response?.data?.detail || "No se pudo cargar el detalle de la solicitud.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto text-gray-500">Cargando…</div>;
  if (error) return <div className="max-w-4xl mx-auto text-red-600">{error}</div>;
  if (!solicitud) return <div className="max-w-4xl mx-auto text-gray-500">No encontrada.</div>;

  const st = estadoUI(solicitud.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
          onClick={() => navigate("/campesino/seguimiento")}
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className={`px-3 py-1.5 border rounded-full text-sm font-bold ${st.cls}`}>
          {st.label}
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800">Solicitud #{solicitud.id}</h1>
        <p className="text-sm text-gray-500">Tipo: {solicitud.request_type}</p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="border rounded-xl p-4">
            <p className="text-xs font-black text-gray-500 uppercase">Municipio</p>
            <p className="font-semibold text-gray-800">{solicitud.data?.municipio || "—"}</p>
          </div>

          <div className="border rounded-xl p-4">
            <p className="text-xs font-black text-gray-500 uppercase">Actividad productiva</p>
            <p className="font-semibold text-gray-800">{solicitud.data?.actividad_productiva || "—"}</p>
          </div>

          <div className="border rounded-xl p-4 md:col-span-2">
            <p className="text-xs font-black text-gray-500 uppercase">Descripción</p>
            <p className="text-gray-800 whitespace-pre-wrap">{solicitud.data?.descripcion_idea || "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-800">Documentos</h2>

        {documentos.length === 0 ? (
          <p className="text-gray-500 text-sm">No has subido documentos todavía.</p>
        ) : (
          <div className="space-y-2">
            {documentos.map((doc) => (
              <div key={doc.id} className="border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{doc.category}</p>
                  <p className="text-xs text-gray-500">
                    {doc.created_at ? new Date(doc.created_at).toLocaleString() : ""}
                  </p>
                </div>

                {/* doc.file suele ser URL (cloudinary) */}
                <a
                  href={doc.file}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#39a900] font-bold hover:underline"
                >
                  Ver
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-800">Historial</h2>

        {timeline.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no hay eventos.</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((ev, idx) => (
              <div key={idx} className="border-l-4 border-[#39a900] pl-4 py-2">
                <p className="font-bold text-gray-800">{ev.event_type || "Evento"}</p>
                <p className="text-sm text-gray-600">{ev.description || "—"}</p>
                <p className="text-xs text-gray-400">
                  {ev.created_at ? new Date(ev.created_at).toLocaleString() : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

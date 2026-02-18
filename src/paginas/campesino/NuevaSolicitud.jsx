// src/paginas/campesino/NuevaSolicitud.jsx
import React, { useRef, useState } from "react";
import { Save, Upload, MapPin, ClipboardList, Image as ImageIcon } from "lucide-react";

import { axiosClient } from "../../api/axiosClient";
import { subirDocumento } from "../../api/documentos";

export default function NuevaSolicitud() {
  const [loading, setLoading] = useState(false);
  const [caseId, setCaseId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Form state
  const [nombreFinca, setNombreFinca] = useState("");
  const [actividad, setActividad] = useState("Cultivo de Café");
  const [vereda, setVereda] = useState("");
  const [hectareas, setHectareas] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState(""); // requerido por backend si es PROYECTO_PRODUCTIVO

  // Upload inputs
  const fotoRef = useRef(null);
  const identidadRef = useRef(null);

  // Helpers
  const buildPayload = (status) => {
    // Mapeo a lo que exige backend:
    // municipio -> vereda
    // actividad_productiva -> actividad
    // descripcion_idea -> descripcion + finca + hectareas
    const data = {
      municipio: vereda,
      actividad_productiva: actividad,
      descripcion_idea:
        (descripcion || "").trim() ||
        `Finca: ${nombreFinca || "-"} | Vereda: ${vereda || "-"} | Hectáreas: ${hectareas || "-"}`,
      monto_estimado: monto || hectareas || "1", // por si el usuario no llena monto aún
    };

    return {
      applicant_type: "CAMPESINO",
      request_type: "PROYECTO_PRODUCTIVO",
      status,
      data,
    };
  };

  const crearOActualizar = async (status) => {
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const payload = buildPayload(status);

      if (!caseId) {
        const { data } = await axiosClient.post("/api/solicitudes/", payload);
        setCaseId(data.id);
        setMsg(status === "BORRADOR" ? `✅ Borrador guardado (#${data.id})` : `✅ Solicitud enviada (#${data.id})`);
      } else {
        // Si ya existe, usamos sync para actualizar (y enviar si toca)
        await axiosClient.post("/api/sync/solicitudes/", [{ local_id: caseId, ...payload }]);
        setMsg(status === "BORRADOR" ? `✅ Borrador actualizado (#${caseId})` : `✅ Solicitud enviada (#${caseId})`);
      }
    } catch (e) {
      const d = e?.response?.data;
      setErr(d?.detail || (typeof d === "object" ? JSON.stringify(d, null, 2) : "Error al guardar/enviar."));
    } finally {
      setLoading(false);
    }
  };

  const asegurarBorrador = async () => {
    if (caseId) return caseId;
    await crearOActualizar("BORRADOR");
    return caseId;
  };

  const subir = async (file, category) => {
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      // Asegura que exista un caseId (borrador)
      let id = caseId;
      if (!id) {
        // crea borrador primero
        const payload = buildPayload("BORRADOR");
        const { data } = await axiosClient.post("/api/solicitudes/", payload);
        id = data.id;
        setCaseId(id);
      }

      const form = new FormData();
      form.append("case_id", String(id));
      form.append("category", category);
      form.append("file", file);

      await subirDocumento(form);
      setMsg("✅ Documento subido correctamente");
    } catch (e) {
      const d = e?.response?.data;
      setErr(d?.detail || "No se pudo subir el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const onFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await subir(file, "OTRO");
    e.target.value = "";
  };

  const onIdentidadChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await subir(file, "IDENTIDAD");
    e.target.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Nueva Solicitud de Validación</h1>
        <p className="text-gray-500 text-sm">Registra tu unidad productiva para recibir los beneficios de CampeSENA</p>
      </header>

      {(msg || err) && (
        <div className={`p-3 rounded-lg border ${err ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-800"}`}>
          {err || msg}
        </div>
      )}

      {caseId && (
        <div className="text-sm text-gray-600">
          ID de solicitud: <b>#{caseId}</b>
        </div>
      )}

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
        {/* Bloque 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#39a900] font-bold border-b pb-2">
            <ClipboardList size={20} />
            <h2>Datos de la Unidad</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre de la Finca</label>
            <input
              type="text"
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#39a900] bg-gray-50"
              placeholder="Ej: Finca La Bonita"
              value={nombreFinca}
              onChange={(e) => setNombreFinca(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Actividad Principal</label>
            <select
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#39a900] bg-white text-sm"
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
            >
              <option>Cultivo de Café</option>
              <option>Producción de Cacao</option>
              <option>Ganadería Sostenible</option>
              <option>Apicultura</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción (obligatorio)</label>
            <textarea
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#39a900] bg-gray-50 min-h-[90px]"
              placeholder="Describe tu unidad productiva..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        {/* Bloque 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#39a900] font-bold border-b pb-2">
            <MapPin size={20} />
            <h2>Ubicación</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Vereda / Corregimiento (Municipio)</label>
            <input
              type="text"
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#39a900] bg-gray-50"
              placeholder="Nombre de la vereda"
              value={vereda}
              onChange={(e) => setVereda(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Hectáreas aproximadas</label>
            <input
              type="number"
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#39a900] bg-gray-50"
              placeholder="0"
              value={hectareas}
              onChange={(e) => setHectareas(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Monto estimado (obligatorio)</label>
            <input
              type="number"
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#39a900] bg-gray-50"
              placeholder="Ej: 5000000"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
        </div>

        {/* Bloque 3: Soportes */}
        <div className="md:col-span-2 bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-200 text-center space-y-4">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white rounded-full shadow-sm mb-2 text-[#39a900]">
              <Upload size={32} />
            </div>
            <h3 className="font-bold text-gray-700">Documentos y Fotos</h3>
            <p className="text-xs text-gray-400">Sube el PDF de tu cédula y fotos de la producción</p>
          </div>

          {/* Inputs ocultos */}
          <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={onFotoChange} />
          <input ref={identidadRef} type="file" accept=".pdf,image/*" className="hidden" onChange={onIdentidadChange} />

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => fotoRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <ImageIcon size={16} /> Subir Foto Finca
            </button>

            <button
              type="button"
              onClick={() => identidadRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <Upload size={16} /> Subir Documento Identidad
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => (window.location.href = "/campesino/dashboard")}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="px-6 py-2.5 text-sm font-bold border rounded-lg flex items-center gap-2"
            onClick={() => crearOActualizar("BORRADOR")}
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Guardando..." : "Guardar Borrador"}
          </button>

          <button
            type="button"
            className="px-8 py-2.5 bg-[#39a900] text-white rounded-lg font-bold flex items-center gap-2 hover:bg-[#2e8800] shadow-lg shadow-green-100 transition-all"
            onClick={() => crearOActualizar("REGISTRADA")}
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}

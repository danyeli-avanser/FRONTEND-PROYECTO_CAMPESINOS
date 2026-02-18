import React, { useEffect, useMemo, useState } from "react";
import { listarDocumentos, subirDocumento } from "../../api/documentos";

const REQUISITOS_MVP = [
  { key: "IDENTIDAD", label: "Documento de identidad", category: "IDENTIDAD", required: true },
  { key: "RUT", label: "RUT actualizado", category: "RUT", required: true },
  { key: "OTRO", label: "Soporte adicional", category: "OTRO", required: false },
];

export default function DocumentosObligatorios({ caseId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    const { data } = await listarDocumentos(caseId);
    setDocs(data);
  };

  useEffect(() => {
    if (caseId) cargar();
  }, [caseId]);

  const subidosPorCategoria = useMemo(() => {
    const s = new Set((docs || []).map((d) => d.category));
    return s;
  }, [docs]);

  const onUpload = async (category, file) => {
    setLoading(true);
    try {
      await subirDocumento({ caseId, category, file });
      await cargar();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
      <h3 className="font-bold text-gray-800">Documentos</h3>

      <div className="space-y-3">
        {REQUISITOS_MVP.map((req) => {
          const ok = subidosPorCategoria.has(req.category);
          return (
            <div key={req.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div>
                <p className="font-semibold text-sm">{req.label} {req.required && <span className="text-red-500">*</span>}</p>
                <p className="text-xs text-gray-500">{ok ? "Cargado" : "Pendiente"}</p>
              </div>

              <div className="flex items-center gap-2">
                {ok ? (
                  <span className="text-green-600 text-xs font-bold">OK</span>
                ) : (
                  <label className="px-4 py-2 bg-[#39a900] text-white rounded-lg text-xs font-bold cursor-pointer">
                    {loading ? "Subiendo..." : "Subir"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload(req.category, f);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <p className="text-xs text-gray-500">
          * Obligatorios para poder enviar/registrar la solicitud.
        </p>
      </div>
    </div>
  );
}

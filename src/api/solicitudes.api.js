// src/api/solicitudes.api.js
import { axiosClient } from "./axiosClient";

// LISTAR solicitudes
export async function listSolicitudes({ page = 1, mias = false } = {}) {
  const qp = new URLSearchParams();
  qp.set("page", String(page));
  if (mias) qp.set("mias", "true");

  const { data } = await axiosClient.get(`/api/solicitudes/?${qp.toString()}`);
  return data;
}

// CREAR solicitud (BORRADOR o REGISTRADA)
export async function createSolicitud(payload) {
  const { data } = await axiosClient.post("/api/solicitudes/", payload);
  return data;
}

// OBTENER detalle
export async function getSolicitud(id) {
  const { data } = await axiosClient.get(`/api/solicitudes/${id}/`);
  return data;
}

// EVENTOS / TIMELINE (ruta principal)
export async function getSolicitudEventos(id) {
  const { data } = await axiosClient.get(`/api/solicitudes/${id}/eventos/`);
  return data;
}

// ✅ ALIAS para compatibilidad con tu DetalleSolicitud.jsx
export async function getSolicitudTimeline(id) {
  // si tu backend también tiene /api/cases/<id>/timeline/, lo podrías cambiar aquí.
  return getSolicitudEventos(id);
}

// SYNC
export async function syncSolicitudes(payloadArray) {
  const { data } = await axiosClient.post("/api/sync/solicitudes/", payloadArray);
  return data;
}

export async function syncOneSolicitud(id, payload) {
  const { data } = await axiosClient.post("/api/sync/solicitudes/", [
    { local_id: Number(id), ...payload },
  ]);
  return data;
}

// Actualizar solicitud (admin)
export async function updateSolicitud(id, payload) {
  const { data } = await axiosClient.patch(`/api/solicitudes/${id}/`, payload);
  return data;
}

// src/api/documentos.api.js
import { axiosClient } from "./axiosClient";

// Subir documento (multipart/form-data)
export async function subirDocumento({ case_id, category, file }) {
  const form = new FormData();
  form.append("case_id", String(case_id));
  form.append("category", category);
  form.append("file", file);

  const { data } = await axiosClient.post("/api/documentos/subir/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// Listar documentos por case_id
export async function listDocumentos(case_id) {
  const { data } = await axiosClient.get(`/api/documentos/?case_id=${case_id}`);
  return data;
}

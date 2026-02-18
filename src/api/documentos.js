import { axiosClient } from "./axiosClient";

export async function subirDocumento(formData) {
  const { data } = await axiosClient.post(
    "/api/documentos/subir/",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function listarDocumentos(caseId) {
  const { data } = await axiosClient.get(
    `/api/documentos/?case_id=${caseId}`
  );
  return data;
}

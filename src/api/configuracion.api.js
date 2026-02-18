import { axiosClient } from "./axiosClient";

export const getDocumentosReq = () => axiosClient.get("/documentos");
export const createDocumentoReq = (data) => axiosClient.post("/documentos", data);
export const updateDocumentoReq = (id, data) => axiosClient.put(`/documentos/${id}`, data);
export const patchDocumentoReq = (id, data) => axiosClient.patch(`/documentos/${id}`, data);

export const getFormulariosReq = () => axiosClient.get("/formularios");

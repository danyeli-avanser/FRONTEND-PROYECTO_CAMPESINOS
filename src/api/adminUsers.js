import { axiosClient } from "./axiosClient";

export async function listUsers(page = 1) {
  const { data } = await axiosClient.get(`/api/accounts/admin/users/?page=${page}`);
  return data; // {count,next,previous,results}
}

export async function createUser(payload) {
  const { data } = await axiosClient.post(`/api/accounts/admin/users/`, payload);
  return data;
}

export async function activarUser(id) {
  const { data } = await axiosClient.put(`/api/accounts/admin/users/${id}/activar/`);
  return data;
}

export async function desactivarUser(id) {
  const { data } = await axiosClient.put(`/api/accounts/admin/users/${id}/desactivar/`);
  return data;
}

import { axiosClient } from "./axiosClient";

export async function login(payload) {
  const { data } = await axiosClient.post("/api/auth/login/", payload);
  return data;
}

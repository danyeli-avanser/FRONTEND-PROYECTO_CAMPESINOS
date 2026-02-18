import axios from "axios";

import { API_BASE_URL } from "../config";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 1) Adjuntar access token en cada request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token_campesena");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2) Refresh automático al recibir 401
let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  queue = [];
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // si no es 401 o ya reintentamos, lanzar normal
    if (error?.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // si no hay refresh token -> logout
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // cola si ya se está refrescando
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // OJO: endpoint de SimpleJWT refresh
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
        refresh,
      });

      // guardar nuevo access
      localStorage.setItem("token_campesena", data.access);

      processQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return axiosClient(original);
    } catch (e) {
      processQueue(e, null);
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

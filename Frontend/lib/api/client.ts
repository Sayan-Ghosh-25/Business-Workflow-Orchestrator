// lib/api/client.ts
import axios, { AxiosInstance } from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token (if exists) on each request
apiClient.interceptors.request.use((cfg) => {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return cfg;
});

// Optional: global response interceptor (centralized error handling)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // You can expand this to integrate with a toast/sentry system
    return Promise.reject(err);
  }
);

export default apiClient;
export { BASE_URL };

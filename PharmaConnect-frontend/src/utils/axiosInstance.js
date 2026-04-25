import axios from "axios";
import { logout } from "./auth";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send cookies with requests
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Attach headers to every request
axiosInstance.interceptors.request.use((config) => {
  // Set Content-Type to application/json only if not FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// On 401, attempt token refresh before redirecting
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        logout();
        const redirect = window.location.pathname !== "/login" ? `?redirect=${encodeURIComponent(window.location.pathname)}` : "";
        window.location.href = `/login${redirect}`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;

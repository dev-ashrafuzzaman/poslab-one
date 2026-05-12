// src/hooks/createAuthRefreshInterceptor.js

import axios from "axios";
import { Config } from "../utils/constants";

export default function createAuthRefreshInterceptor({
  axiosInstance,
  refreshEndpoint = "/auth/refresh",
  setAccessToken,
  onRefreshFail,
}) {
  let isRefreshing = false;
  let queue = [];

  const processQueue = (error, token = null) => {
    queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
    queue = [];
  };

  axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;
      if (!error.response) return Promise.reject(error);

      const status = error.response.status;
     if (
  (status !== 401 && status !== 403) ||
  originalRequest._retry ||
  originalRequest.url.includes("/auth/refresh")
) {
  return Promise.reject(error);
}


      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `${Config.auth.type} ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const raw = axios.create({
          baseURL: axiosInstance.defaults.baseURL,
          withCredentials: true,
          timeout: 15000,
        });

        const resp = await raw.post(refreshEndpoint);
        const newAccessToken = resp?.data?.accessToken;

        if (!newAccessToken) throw new Error("No access token");

        setAccessToken(newAccessToken);
        axiosInstance.defaults.headers.common.Authorization =
          `${Config.auth.type} ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization =
          `${Config.auth.type} ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err);
        await onRefreshFail?.();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
  );
}

import { useMemo, useEffect } from "react";
import axios from "axios";
import createAuthRefreshInterceptor from "./createAuthRefreshInterceptor";
import {
  getAccessToken,
  setAccessToken,
  clearTokens,
} from "../utils/token";
import { Config } from "../utils/constants";

export default function useAxiosSecure({ onRefreshFail } = {}) {
  const axiosSecure = useMemo(
    () =>
      axios.create({
        baseURL: `${Config.api.url}/api/${Config.api.version}`,
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
        withCredentials: true,
      }),
    []
  );

  useEffect(() => {
    const reqId = axiosSecure.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `${Config.auth.type} ${token}`;
      }
      return config;
    });

    createAuthRefreshInterceptor({
      axiosInstance: axiosSecure,
      refreshEndpoint: "/auth/refresh",
      setAccessToken,
      onRefreshFail: async () => {
        clearTokens();
        await onRefreshFail?.();
      },
    });

    return () => axiosSecure.interceptors.request.eject(reqId);
  }, [axiosSecure, onRefreshFail]);

  return { axiosSecure };
}

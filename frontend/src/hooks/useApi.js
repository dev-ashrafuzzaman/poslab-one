import { useState, useRef, useCallback } from "react";
import useAxiosSecure from "./useAxiosSecure";
import { toast } from "sonner";

/* -------------------------------
   Simple in-memory cache (GET only)
-------------------------------- */
const cacheStore = new Map();

const getCacheKey = (url, params) => `${url}:${JSON.stringify(params || {})}`;

/* -------------------------------
   Error normalizer
-------------------------------- */
const normalizeError = (err) => {
  return err?.response?.data?.message || err?.message || "Something went wrong";
};

export default function useApi() {
  const { axiosSecure } = useAxiosSecure();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const abortRef = useRef(null);

  /* -------------------------------
     Cancel running request
  -------------------------------- */
  const cancelRequest = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  /* -------------------------------
     Main request handler
  -------------------------------- */
  const request = useCallback(
    async (
      url,
      method = "GET",
      payload = {},
      {
        cacheDuration = 60_000,
        retries = 0,
        retryDelay = 800,
        useToast = true,
        successMessage,
        errorMessage,
        onSuccess,
        onError,
        onFinally,
        config = {},
      } = {},
    ) => {
      const isGet = method === "GET";

      setLoading(true);
      setError(null);

      /* ---------- Cache (GET only) ---------- */
      const cacheKey = getCacheKey(url, payload);

      if (isGet && cacheStore.has(cacheKey)) {
        const cached = cacheStore.get(cacheKey);
        if (Date.now() - cached.time < cacheDuration) {
          setData(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      /* ---------- Abort previous ---------- */
      if (method !== "GET") {
        cancelRequest();
      }
      abortRef.current = new AbortController();

      const axiosCall = () =>
        axiosSecure({
          url,
          method,
          signal: abortRef.current.signal,
          params: isGet ? payload : undefined,
          data: !isGet ? payload : undefined,
          ...config,
        });

      /* ---------- Retry loop ---------- */
      let attempt = 0;

      while (true) {
        try {
          const res = await axiosCall();
          const resData = res?.data;

          setData(resData);

          if (isGet) {
            cacheStore.set(cacheKey, {
              data: resData,
              time: Date.now(),
            });
          }

          if (useToast) {
            toast.success(
              successMessage || resData?.message || "Operation successful",
            );
          }

          onSuccess?.(resData);
          return resData;
        } catch (err) {
          attempt++;

          if (err.name === "CanceledError") {
            return;
          }

          if (attempt > retries) {
            const msg = errorMessage || normalizeError(err);

            setError(err);
            if (useToast) toast.error(msg);
            onError?.(err);
            throw err;
          }

          await new Promise((r) => setTimeout(r, retryDelay * attempt));
        } finally {
          if (attempt > retries) {
            setLoading(false);
            onFinally?.();
          }
        }
      }
    },
    [axiosSecure],
  );

  return {
    request,
    cancelRequest,
    loading,
    error,
    data,
  };
}

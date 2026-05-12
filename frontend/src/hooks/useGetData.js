import { useState, useEffect, useCallback, useMemo } from "react";
import useAxiosSecure from "./useAxiosSecure";

/**
 * Generic GET hook (Auth-aware)
 * Uses axiosSecure (auto refresh, auth header)
 */
export default function useGetData(route, options = {}) {
  const {
    query = {},
    autoFetch = true,
    deps = [],
    transform,
    onError,
  } = options;

  const { axiosSecure } = useAxiosSecure();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  /* ===========================
     BUILD QUERY STRING
  =========================== */
  const queryString = useMemo(() => {
    const params = new URLSearchParams(query);
    return params.toString() ? `?${params}` : "";
  }, [query]);

  /* ===========================
     FETCH FUNCTION
  =========================== */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosSecure.get(`${route}${queryString}`);
      const result = transform ? transform(res.data) : res.data;
      setData(result);
      return result;
    } catch (err) {
      console.error("GET error:", err);
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, route, queryString, transform, onError]);

  /* ===========================
     AUTO FETCH
  =========================== */
  useEffect(() => {
    if (!autoFetch) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

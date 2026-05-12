import { useState, useRef } from "react";
import useAxiosSecure from "./useAxiosSecure";
import { toast } from "sonner";

export default function useApiLite() {
  const { axiosSecure } = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const request = async (url, method = "GET", payload = {}, opts = {}) => {
    setLoading(true);
    abortRef.current = new AbortController();

    try {
      const res = await axiosSecure({
        url,
        method,
        data: ["GET", "DELETE"].includes(method) ? undefined : payload,
        params: ["GET", "DELETE"].includes(method) ? payload : undefined,
        signal: abortRef.current.signal,
      });

      opts.successMessage && toast.success(opts.successMessage);
      return res.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, cancel: () => abortRef.current?.abort() };
}

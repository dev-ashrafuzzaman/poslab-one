import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";

export default function ProtectedWidget() {
  const { axiosSecure } = useAuth(); // axios from context
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axiosSecure.get("/api/v1/protected/some-data/");
        if (mounted) setData(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => (mounted = false);
  }, [axiosSecure]);

  if (!data) return <div className="p-4 border rounded">Loading widget...</div>;

  return <div className="p-4 border rounded">Widget: {JSON.stringify(data)}</div>;
}

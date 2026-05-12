import { useCallback } from "react";
import useApi from "../../../hooks/useApi";

export default function usePosAsyncLoaders() {
  const { request } = useApi();

  /* ---------------- Customers ---------------- */
  const loadCustomers = useCallback(
    async (search) => {
      const res = await request(
        "/customers",
        "GET",
        { search, limit: 10 },
        { useToast: false }
      );

      return res?.data?.map((c) => ({
        label: `${c.code} - ${c.name} (${c.phone})`,
        value: c._id,
        raw: c,
      }));
    },
    [request]
  );

  /* ---------------- Employees ---------------- */
  const loadEmployees = useCallback(
    async (search) => {
      const res = await request(
        "/employees",
        "GET",
        { search, limit: 10 },
        { useToast: false }
      );

      return res?.data?.map((e) => ({
        label: `${e.code} - ${e?.name}`,
        value: e._id,
        raw: e,
      }));
    },
    [request]
  );

  /* ---------------- Payment Methods ---------------- */
  const loadPaymentMethods = useCallback(
    async (search) => {
      const res = await request(
        "/sales/payment-methods",
        "GET",
        {
          search,
          parentCode: "1002",
          limit: 10,
        },
        { useToast: false }
      );

      return res?.data?.map((m) => ({
        label: `${m.code} - ${m.name}`,
        value: m._id,
        raw: m,
      }));
    },
    [request]
  );

  return {
    loadCustomers,
    loadEmployees,
    loadPaymentMethods,
  };
}

import { useCallback, useMemo, useState } from "react";

/**
 * Empty payment row template
 * amount MUST be string to allow empty input
 */
const EMPTY_ROW = {
  method: "",
  accountId: "",
  option: null,
  amount: "",
  reference: "",
  manualClear: false,
};

export default function usePosPayment(totalAmount) {
  const [payments, setPayments] = useState([{ ...EMPTY_ROW }]);
const [roundAmount, setRoundAmount] = useState(0);
  /* =========================
     Helpers
  ========================== */

  const parseAmount = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : Math.max(num, 0);
  };

  /* =========================
     Calculations
  ========================== */

  const paidAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + parseAmount(p.amount), 0);
  }, [payments]);

  const remaining = useMemo(
    () => Math.max(totalAmount - paidAmount, 0),
    [totalAmount, paidAmount],
  );

  const changeAmount = useMemo(
    () => Math.max(paidAmount - totalAmount, 0),
    [totalAmount, paidAmount],
  );

  /* =========================
     Actions
  ========================== */

  const resetPayment = useCallback(() => {
    setPayments([{ ...EMPTY_ROW }]);
  }, []);

  const addPayment = useCallback(() => {
    setPayments((prev) => {
      const alreadyPaid = prev.reduce((s, p) => s + parseAmount(p.amount), 0);

      const remainingAmount = totalAmount - alreadyPaid;

      return [
        ...prev,
        {
          ...EMPTY_ROW,
          amount: remainingAmount > 0 ? String(remainingAmount) : "",
        },
      ];
    });
  }, [totalAmount]);

  const removePayment = useCallback((index) => {
    setPayments((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  }, []);

  const markManualClear = useCallback((index) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, manualClear: true } : p)),
    );
  }, []);

  const clearManualClear = useCallback((index) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, manualClear: false } : p)),
    );
  }, []);

const updatePayment = useCallback((index, field, value) => {
  setPayments((prev) =>
    prev.map((payment, i) => {
      if (i !== index) return payment;

      /* -----------------------------
         Prevent duplicate account
      ----------------------------- */
      if (
        field === "accountId" &&
        prev.some((p, idx) => idx !== index && p.accountId === value)
      ) {
        return payment;
      }

      /* -----------------------------
         Amount Validation
      ----------------------------- */
      if (field === "amount") {
        // allow empty input
        if (value === "") {
          return { ...payment, amount: "" };
        }

        let amount = Number(value);

        // invalid or negative
        if (isNaN(amount) || amount < 0) {
          amount = 0;
        }

        // change support → no upper limit
        return {
          ...payment,
          amount: String(amount),
        };
      }

      /* -----------------------------
         Normal field update
      ----------------------------- */
      return {
        ...payment,
        [field]: value,
      };
    })
  );
}, []);

  /* =========================
     Validation
  ========================== */

  const isValid = useMemo(() => {
    if (!payments.length) return false;
    if (paidAmount < totalAmount) return false;

    return payments.every(
      (p) => p.accountId && p.method && Number(p.amount) > 0, // 🔥 empty & 0 invalid
    );
  }, [payments, paidAmount, totalAmount]);

  /* =========================
     Public API
  ========================== */

  return {
    payments,
    addPayment,
    removePayment,
    updatePayment,
    paidAmount,
    remaining,
    changeAmount,
    isValid,
    markManualClear,
    clearManualClear,
    resetPayment,
  };
}

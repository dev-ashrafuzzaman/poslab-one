import { useCallback, useMemo, useState } from "react";

const EMPTY_ROW = {
  method: "",
  accountId: "",
  amount: "",
  reference: "",
  raw: null,
};

/**
 * Enterprise Financial Split-Payment Engine
 * @param {number} totalAmount - Total payable net amount
 * @param {object} options - Dynamic configuration rules
 */
export default function useFinancialPayment(totalAmount = 0, options = {}) {
  const { allowChange = false, allowDue = true, maxLimit = null } = options;

  const [payments, setPayments] = useState([{ ...EMPTY_ROW }]);

  const parseAmount = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : Math.max(num, 0);
  };

  const paidAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + parseAmount(p.amount), 0);
  }, [payments]);

  const remaining = useMemo(() => {
    const rem = totalAmount - paidAmount;
    return rem > 0 ? rem : 0;
  }, [totalAmount, paidAmount]);

  const changeAmount = useMemo(() => {
    if (!allowChange) return 0;
    const change = paidAmount - totalAmount;
    return change > 0 ? change : 0;
  }, [allowChange, totalAmount, paidAmount]);

  const resetPayment = useCallback(() => {
    setPayments([{ ...EMPTY_ROW }]);
  }, []);

  const addPayment = useCallback(() => {
    setPayments((prev) => {
      const alreadyPaid = prev.reduce((s, p) => s + parseAmount(p.amount), 0);
      const remainingAmount = totalAmount - alreadyPaid;

      if (maxLimit && alreadyPaid >= maxLimit) return prev;

      return [
        ...prev,
        {
          ...EMPTY_ROW,
          amount: remainingAmount > 0 ? String(remainingAmount) : "",
        },
      ];
    });
  }, [totalAmount, maxLimit]);

  const removePayment = useCallback((index) => {
    setPayments((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  }, []);

  const updatePayment = useCallback(
    (index, field, value) => {
      setPayments((prev) =>
        prev.map((payment, i) => {
          if (i !== index) return payment;

          if (
            field === "accountId" &&
            prev.some((p, idx) => idx !== index && p.accountId === value)
          ) {
            return payment;
          }

          if (field === "amount") {
            if (value === "") return { ...payment, amount: "" };

            let amount = Number(value);
            if (isNaN(amount) || amount < 0) amount = 0;

            if (!allowChange && !allowDue && amount > totalAmount) {
              amount = totalAmount;
            }

            if (maxLimit && amount > maxLimit) {
              amount = maxLimit;
            }

            return { ...payment, amount: String(amount) };
          }

          return { ...payment, [field]: value };
        }),
      );
    },
    [allowChange, allowDue, totalAmount, maxLimit],
  );

  const isValid = useMemo(() => {
    if (!allowDue && paidAmount < totalAmount) return false;

    if (maxLimit && paidAmount > maxLimit) return false;

    if (paidAmount === 0) {
      return true;
    }

    return payments.every((p) => {
      const amt = parseAmount(p.amount);
      if (amt > 0) {
        return p.accountId && p.method;
      }
      return true;
    });
  }, [payments, paidAmount, totalAmount, allowDue, maxLimit]);

  return {
    payments,
    addPayment,
    removePayment,
    updatePayment,
    paidAmount,
    remaining,
    changeAmount,
    isValid,
    resetPayment,
  };
}

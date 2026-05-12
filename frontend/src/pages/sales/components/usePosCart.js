import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const LOW_STOCK_THRESHOLD = 3;

export default function usePosCart() {
  const [cart, setCart] = useState([]);
  const [billDiscount, setBillDiscount] = useState(0);

  /* ---------------- Reset Cart ---------------- */
  const resetCart = () => {
    setCart([]);
    setBillDiscount(0);
  };

  /* ---------------- Add Item (SCAN / SELECT) ---------------- */
  const addItem = useCallback((item) => {
    setCart((prev) => {
      const found = prev.find((i) => i.variantId === item.variantId);

      /* 🔁 Same SKU scanned again */
      if (found) {
        if (found.qty + 1 > found.stockQty) {
          toast.error(`Only ${found.stockQty} item(s) available`);
          return prev;
        }

        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, qty: i.qty + 1 } : i,
        );
      }

      /* ➕ New item */
      return [
        ...prev,
        {
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          productName: item.productName,

          salePrice: Number(item.salePrice),
          finalPrice: Number(item.finalPrice ?? item.salePrice),

          stockQty: Number(item.qty), // 🔥 freeze stock
          qty: 1,

          ...(item.discountId && {
            discountId: item.discountId,
          }),
          discountType: item.discountType,
          discountValue: Number(item.discountValue),
        },
      ];
    });
  }, []);

  /* ---------------- Update Qty ---------------- */
  const updateQty = useCallback((variantId, nextQty) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.variantId !== variantId) return i;

        let qty = Math.max(1, Number(nextQty) || 1);

        if (qty > i.stockQty) {
          toast.error(`Only ${i.stockQty} item(s) available`);
          qty = i.stockQty;
        }

        return { ...i, qty };
      }),
    );
  }, []);

  /* ---------------- Remove Item ---------------- */
  const removeItem = useCallback((variantId) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  /* ---------------- Subtotal (🔥 BACKEND PRICE ONLY) ---------------- */
  const subtotal = useMemo(() => {
    return cart.reduce((sum, i) => {
      const unitPrice = i.finalPrice ?? i.salePrice;
      return sum + Math.max(i.qty * unitPrice, 0);
    }, 0);
  }, [cart]);

  /* ---------------- Grand Total ---------------- */
  const grandTotal = Math.max(subtotal - Number(billDiscount || 0), 0);

  /* ---------------- Low Stock Indicator ---------------- */
  const isLowStock = useCallback(
    (item) => item.stockQty - item.qty <= LOW_STOCK_THRESHOLD,
    [],
  );

  /* ---------------- Apply Membership Pricing (PREVIEW) ---------------- */
  const applyMembershipPricing = useCallback(
    ({ isMember, membershipPercent }) => {
      setCart((prev) =>
        prev.map((item) => {
          // ✅ Campaign discount already আছে → keep as is
          if (item.discountType && item.discountValue > 0) {
            return {
              ...item,
              finalPrice:
                item.discountType === "PERCENT"
                  ? item.salePrice - (item.salePrice * item.discountValue) / 100
                  : item.salePrice - item.discountValue,
              discountSource: "CAMPAIGN",
            };
          }

          // 🔥 No campaign discount + member
          if (isMember && membershipPercent > 0) {
            const finalPrice =
              item.salePrice - (item.salePrice * membershipPercent) / 100;

            return {
              ...item,
              discountType: "PERCENT",
              discountValue: membershipPercent,
              discountSource: "MEMBERSHIP",
              finalPrice,
            };
          }

          // ❌ No discount
          return {
            ...item,
            discountType: null,
            discountValue: 0,
            discountSource: "NONE",
            finalPrice: item.salePrice,
          };
        }),
      );
    },
    [],
  );

  return {
    cart,
    addItem,
    updateQty,
    removeItem,
    applyMembershipPricing,
    subtotal,
    billDiscount,
    setBillDiscount,
    grandTotal,

    isLowStock,
    resetCart,
  };
}

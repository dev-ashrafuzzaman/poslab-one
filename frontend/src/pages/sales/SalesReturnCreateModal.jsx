import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/modals/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useApi from "../../hooks/useApi";

export default function SalesReturnCreateModal({
  open,
  setOpen,
  saleId,
  onSuccess,
}) {
  const { request } = useApi();

  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  /* =====================
     LOAD SALE
  ====================== */
  useEffect(() => {
    if (!open || !saleId) return;

    request(`/sales/${saleId}/return`, "GET", null, {
      onSuccess: (res) => {
        const saleData = res.data;
        setSale(saleData);
   
        setItems(
          saleData.items.map((i) => ({
            saleItemId: i._id,
            sku: i.sku,
            name: i.productName || i.sku,
            soldQty: i.qty,
            returnQty: 0,
            reason: "",
            salePrice: i.salePrice, // gross unit price
            itemDiscount: i?.discount?.amount || 0, // total item discount
          })),
        );
      },
    });
  }, [open, saleId]);

  /* =====================
     REFUND CALCULATOR
  ====================== */
  const calculateRefund = (item) => {
    if (!sale) return 0;

    const returnQty = Number(item.returnQty || 0);
    if (returnQty <= 0) return 0;

    // Gross
    const returnGross = item.salePrice * returnQty;

    // Item discount (proportional)
    const unitItemDiscount =
      item.soldQty > 0 ? item.itemDiscount / item.soldQty : 0;
    const returnItemDiscount = unitItemDiscount * returnQty;

    // Bill discount (proportional to gross)
    const billDiscountRatio =
      sale.subTotal > 0 ? sale.billDiscount / sale.subTotal : 0;
    const returnBillDiscount = returnGross * billDiscountRatio;

    // VAT (proportional)
    const vatRatio = sale.subTotal > 0 ? sale.taxAmount / sale.subTotal : 0;
    const returnVat = returnGross * vatRatio;

    // Final refund
    return returnGross - returnItemDiscount - returnBillDiscount + returnVat;
  };

  /* =====================
     TOTAL REFUND
  ====================== */
  const totalRefund = useMemo(() => {
    return items.reduce((sum, item) => sum + calculateRefund(item), 0);
  }, [items, sale]);

  /* =====================
     SUBMIT RETURN
  ====================== */
  const submitReturn = async () => {
    const payload = {
      refundMethod: "CASH",
      items: items
        .filter((i) => i.returnQty > 0)
        .map((i) => ({
          saleItemId: i.saleItemId,
          qty: i.returnQty,
          reason: i.reason || "Returned",
        })),
    };

    if (!payload.items.length) return;

    await request(`/sales/${saleId}/return`, "POST", payload, {
      successMessage: "Sales return completed",
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
    });
  };

  /* =====================
     LOADING
  ====================== */
  if (!sale) {
    return (
      <Modal isOpen={open} setIsOpen={setOpen} title="Sales Return">
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      </Modal>
    );
  }

  /* =====================
     UI
  ====================== */
  return (
    <Modal
      isOpen={open}
      setIsOpen={setOpen}
      title="Sales Return"
      size="5xl"
      footer={
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total Refund:{" "}
            <span className="text-red-600">BDT {totalRefund}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReturn}
              disabled={totalRefund <= 0 || !confirmed}
              variant="gradient"
            >
              Confirm Return
            </Button>
          </div>
        </div>
      }
    >
      {/* ---------- SALE INFO ---------- */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-4 text-sm">
        <div>
          <div className="flex justify-between">
            <span>Invoice:</span>
            <strong>{sale.invoiceNo}</strong>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <strong>{new Date(sale.createdAt).toLocaleDateString()}</strong>
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <strong>{sale.customer?.name || "Walk-in"}</strong>
          </div>
          <div className="flex justify-between">
            <span>Phone:</span>
            <strong>{sale.customer?.phone || "-"}</strong>
          </div>
        </div>
      </div>

      {/* ---------- ITEMS ---------- */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const refund = calculateRefund(item);

          return (
            <div
              key={item.saleItemId}
              className="grid grid-cols-12 gap-3 items-center border p-3 rounded-lg"
            >
              <div className="col-span-4">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.sku}</div>
              </div>

              <div className="col-span-2 text-sm">
                Sold: <strong>{item.soldQty}</strong>
              </div>

              <div className="col-span-2">
                <Input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  min={0}
                  max={item.soldQty}
                  value={item.returnQty}
                  onChange={(e) => {
                    const v = Math.min(
                      Number(e.target.value || 0),
                      item.soldQty,
                    );
                    setItems((prev) =>
                      prev.map((x, j) =>
                        j === idx ? { ...x, returnQty: v } : x,
                      ),
                    );
                  }}
                />
              </div>

              <div className="col-span-2 text-sm">
                Refund:{" "}
                <strong className="text-red-600">
                  {refund > 0 ? `BDT ${refund}` : "-"}
                </strong>
              </div>

              <div className="col-span-2">
                <Input
                  placeholder="Reason"
                  value={item.reason}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, j) =>
                        j === idx ? { ...x, reason: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            </div>
          );
        })}

        {/* ---------- CONFIRM ---------- */}
        <div className="mt-6 border-t pt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="confirmReturn"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4"
          />
          <label
            htmlFor="confirmReturn"
            className="text-sm text-gray-700 select-none"
          >
            I confirm that the above return quantities and refund amount are
            correct
          </label>
        </div>
      </div>
    </Modal>
  );
}

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Page from "../../../components/common/Page";
import useApi from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import TransferReceiveScanner from "../components/TransferReceiveScanner";
import { toast } from "sonner";
import { Package, AlertCircle, CheckCircle, Clock, Truck } from "lucide-react";
import { useAuth } from "../../../context/useAuth";

/* ===============================
   SOUNDS
=============================== */
const successSound = new Audio("/sounds/scan-success.mp3");
const errorSound = new Audio("/sounds/scan-error.mp3");

const ReceiveStockTransferPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const { user } = useAuth();
  const scannerRef = useRef(null);

  const [transfer, setTransfer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD TRANSFER
  =============================== */
  useEffect(() => {
    request(`/stocks/transfers/${id}`, "GET").then((res) => {
      setTransfer(res.data);
      setItems(
        res.data.items.map((i) => ({
          ...i,
          receivedQty: i.receivedQty ?? 0,
        })),
      );
    });
  }, [id, request]);

  /* ===============================
     AUTO FOCUS SCAN
  =============================== */
  useEffect(() => {
    scannerRef.current?.clearAndFocus();
  }, [transfer]);

  if (!transfer) return null;

  /* ===============================
     RBAC
  =============================== */
  const allowedRoles = ["Admin", "Super Admin"];

  const isReceiver =
    (transfer?.toBranch?.code === "WH-MAIN" &&
      allowedRoles.includes(user?.roleName)) ||
    String(transfer?.toBranch?._id) === String(user?.branchId);

  /* ===============================
     ITEM STATUS HELPERS
  =============================== */
  const getItemStatus = (i) => {
    if (i.receivedQty === 0) return "WAITING";
    if (i.receivedQty < i.sentQty) return "PARTIAL";
    if (i.receivedQty === i.sentQty) return "MATCHED";
    return "EXCEEDED";
  };

  /* ===============================
     SUMMARY STATS
  =============================== */
  const totalItems = items.length;
  const waiting = items.filter((i) => i.receivedQty === 0).length;
  const partial = items.filter(
    (i) => i.receivedQty > 0 && i.receivedQty < i.sentQty,
  ).length;
  const matched = items.filter((i) => i.receivedQty === i.sentQty).length;
  const exceeded = items.filter((i) => i.receivedQty > i.sentQty).length;

  /* ===============================
     SCAN HANDLER
  =============================== */
  const handleScan = (item) => {
    const status = getItemStatus(item);

    if (status === "MATCHED") {
      errorSound.play();
      toast.warning("Item already fully received");
      return;
    }

    successSound.play();

    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id ? { ...i, receivedQty: i.receivedQty + 1 } : i,
      ),
    );

    toast.success("Item scanned");
    scannerRef.current?.clearAndFocus();
  };

  /* ===============================
     CONFIRM RECEIVE
  =============================== */
  const confirmReceive = async () => {
    const hasExceeded = exceeded > 0;

    if (hasExceeded) {
      toast.error("Quantity exceeded for some items");
      return;
    }

    const hasMismatch = partial > 0 || waiting > 0;

    if (hasMismatch) {
      const ok = window.confirm(
        "Some items are partially received or missing.\nDo you want to continue?",
      );
      if (!ok) return;
    }

    setLoading(true);

    try {
      await request(
        `/stocks/transfers/${id}/receive`,
        "POST",
        { items },
        {
          successMessage: hasMismatch
            ? "Stock received with mismatch"
            : "Stock received successfully",
        },
      );

      navigate("/inventory/manage-transfer");
    } catch (err) {
      toast.error(err?.message || "Failed to receive stock. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Receive Stock Transfer" subTitle={transfer.transferNo}>
      <div className="space-y-6">
        {/* ===== SUMMARY ===== */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </Card>

          <Card className="bg-gray-50">
            <div className="p-4">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Waiting
              </p>
              <p className="text-2xl font-bold">{waiting}</p>
            </div>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <div className="p-4">
              <p className="text-sm text-amber-700 flex items-center gap-1">
                <Truck className="h-4 w-4" /> Partial
              </p>
              <p className="text-2xl font-bold text-amber-700">{partial}</p>
            </div>
          </Card>

          <Card className="bg-emerald-50 border-emerald-200">
            <div className="p-4">
              <p className="text-sm text-emerald-700 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Matched
              </p>
              <p className="text-2xl font-bold text-emerald-700">{matched}</p>
            </div>
          </Card>
        </div>

        {/* ===== SCANNER ===== */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Scan Items</h3>
                <p className="text-sm text-gray-500">
                  Scan items included in this transfer
                </p>
              </div>

              {!isReceiver && (
                <Badge variant="danger">Not allowed to receive</Badge>
              )}
            </div>

            <TransferReceiveScanner
              ref={scannerRef}
              items={items}
              disabled={!isReceiver}
              onScan={handleScan}
            />
          </div>
        </Card>

        {/* ===== TABLE ===== */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-center">Sent</th>
                <th className="px-4 py-3 text-center">Received</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((i) => {
                const status = getItemStatus(i);

                return (
                  <tr key={i._id}>
                    <td className="px-4 py-3">
                      {i.variant.sku} – {i.variant.attributes.color} –{" "}
                      {i.variant.attributes.size}
                    </td>

                    <td className="px-4 py-3 text-center">{i.sentQty}</td>

                    <td className="px-4 py-3 text-center font-bold">
                      {i.receivedQty}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {status === "WAITING" && (
                        <Badge variant="secondary">Waiting</Badge>
                      )}
                      {status === "PARTIAL" && (
                        <Badge variant="warning">Partial</Badge>
                      )}
                      {status === "MATCHED" && (
                        <Badge variant="success">Matched</Badge>
                      )}
                      {status === "EXCEEDED" && (
                        <Badge variant="danger">Exceeded</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* ===== CONFIRM ===== */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={confirmReceive}
            disabled={!isReceiver || loading}
            icon={<Package className="h-5 w-5" />}
          >
            {loading ? "Processing..." : "Confirm Receive"}
          </Button>
        </div>
      </div>
    </Page>
  );
};

export default ReceiveStockTransferPage;

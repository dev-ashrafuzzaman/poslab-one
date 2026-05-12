import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import Page from "../../../components/common/Page";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Hash, 
  Package, 
  BarChart3,
  ScanLine,
  Upload
} from "lucide-react";
import useApi from "../../../hooks/useApi";

const AuditScanPage = () => {
  const { auditId } = useParams();
  const { request } = useApi();

  const [audit, setAudit] = useState(null);
  const [items, setItems] = useState([]);
  const [sku, setSku] = useState("");
  const [loading, setLoading] = useState(true);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);

  useEffect(() => {
    successSoundRef.current = new Audio("/sounds/scan-success.mp3");
    errorSoundRef.current = new Audio("/sounds/scan-error.mp3");
  }, []);

  /* ---------- Load once ---------- */
  useEffect(() => {
    request(`/audits/${auditId}`, "GET", {}, { useToast: false })
      .then((res) => {
        setAudit(res.audit);
        setItems(res.items);
      })
      .finally(() => setLoading(false));
  }, [auditId, request]);

  /* ---------- Scan handler ---------- */
  const handleScan = useCallback(
    async (e) => {
      if (e.key !== "Enter" || !sku || !auditId) return;

      try {
        const res = await request(
          `/audits/${auditId}/scan`,
          "POST",
          { sku },
          { useToast: false },
        );

        if (!res?.item) return;

        /* 🔊 success sound */
        successSoundRef.current.currentTime = 0;
        successSoundRef.current.play();

        /* 🟢 subtle success toast */
        toast.success(`Scanned: ${res.item.sku}`, {
          duration: 800,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
          },
        });

        setItems((prev) => {
          const idx = prev.findIndex((i) => i.sku === res.item.sku);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = res.item;
            return copy;
          }
          return [res.item, ...prev];
        });

        setSku("");
      } catch (err) {
        /* 🔊 error sound */
        errorSoundRef.current.currentTime = 0;
        errorSoundRef.current.play();

        /* 🔴 error toast */
        toast.error(
          err?.response?.data?.message ||
            "Scan failed. Quantity limit exceeded.",
          {
            duration: 2500,
            style: {
              background: "linear-gradient(135deg, #fda085 0%, #f6d365 100%)",
              color: "#333",
              border: "none",
            },
          },
        );
      }
    },
    [sku, auditId, request],
  );

  /* ---------- Submit ---------- */
  const submitAudit = async () => {
    const res = await request(
      `/audits/${auditId}/submit`,
      "POST",
      {},
      {
        successMessage: "Audit submitted",
      },
    );
    setAudit((a) => ({ ...a, status: "SUBMITTED", totals: res.totals }));
  };

  if (loading) return <Page title="Audit">Loading...</Page>;

  const statusColors = {
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    SUBMITTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <Page 
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit #{audit.auditNo}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[audit.status]}`}>
                {audit.status.replace("_", " ")}
              </span>
              <span className="text-gray-500 text-sm">
                • {items.length} items
              </span>
            </div>
          </div>
        </div>
      }
    >
      {/* Scan Section */}
      {audit.status === "IN_PROGRESS" && (
        <div className="bg-linear-to-r from-white to-indigo-50 rounded-2xl p-6 mb-8 border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Scan SKU</h2>
          </div>
          <Input
            label=""
            placeholder="Scan barcode and press Enter"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onKeyDown={handleScan}
            autoFocus
            className="bg-white border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
            suffixIcon={
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                  Enter
                </span>
              </div>
            }
          />
          <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
            <Package className="w-4 h-4" />
            Scan items to update audit quantities
          </p>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Audit Items</h2>
            </div>
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{items.length}</span> items
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SKU
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  System
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Audit
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((r) => (
                <tr 
                  key={r._id} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{r.productName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      {r.sku}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-700">{r.systemQty}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`font-bold ${r.auditQty !== r.systemQty ? "text-indigo-600" : "text-gray-900"}`}>
                      {r.auditQty}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {r.differenceQty === 0 ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="font-medium text-emerald-600">Match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-500" />
                          <span className={`font-bold ${r.differenceQty > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {r.differenceQty > 0 ? "+" : ""}{r.differenceQty}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Button */}
      {audit.status === "IN_PROGRESS" && (
        <div className="mt-8 flex justify-end">
          <Button
            variant="gradient"
            onClick={submitAudit}
            className="px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            gradientFrom="from-indigo-600"
            gradientTo="to-purple-600"
            icon={<Upload className="w-5 h-5" />}
          >
            Submit Audit
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      {audit.totals && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-r from-emerald-50 to-white p-5 rounded-xl border border-emerald-100">
            <div className="text-sm text-emerald-700 font-medium">Total Matches</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {items.filter(i => i.differenceQty === 0).length}
            </div>
          </div>
          <div className="bg-linear-to-r from-blue-50 to-white p-5 rounded-xl border border-blue-100">
            <div className="text-sm text-blue-700 font-medium">Variances</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {items.filter(i => i.differenceQty !== 0).length}
            </div>
          </div>
          <div className="bg-linear-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-700 font-medium">Total Scanned</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {items.length}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default AuditScanPage;
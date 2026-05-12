import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeftRight,
  Calendar,
  FileText,
  Package,
  RefreshCw,
  Search,
  Truck,
  Wallet,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import useApi from "../../hooks/useApi";

const today = () => new Date().toISOString().split("T")[0];

export default function PurchaseReturnCreatePage() {
  const { request } = useApi();

  const [purchase, setPurchase] = useState(null);
  const [items, setItems] = useState([]);

  /* ---------------- FORM ---------------- */
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      returnDate: today(),
      reason: "",
      cashRefund: 0,
      dueAdjust: 0,
    },
  });

  const cashRefund = Number(watch("cashRefund")) || 0;
  const dueAdjust = Number(watch("dueAdjust")) || 0;

  /* ---------------- CALC ---------------- */
  const returnAmount = useMemo(
    () => items.reduce((sum, i) => sum + i.returnQty * i.costPrice, 0),
    [items],
  );

  useEffect(() => {
    setValue("cashRefund", returnAmount);
    setValue("dueAdjust", 0);
  }, [returnAmount]);

  /* ---------------- LOAD PURCHASE ---------------- */
  const onSelectPurchase = async (purchaseId) => {
    const res = await request(`/purchases/${purchaseId}`, "GET");
    const data = res?.data;
    setPurchase(data);

    setItems(
      data.items.map((i) => ({
        variantId: i.variantId,
        label: `${i.productName} (${i.sku})`,
        purchasedQty: i.qty,
        returnQty: 0,
        costPrice: i.costPrice,
      })),
    );
  };

  /* ---------------- UPDATE QTY ---------------- */
  const updateQty = (index, value) => {
    const qty = Number(value) || 0;

    setItems((prev) =>
      prev.map((i, idx) =>
        idx === index
          ? {
              ...i,
              returnQty: Math.min(qty, i.purchasedQty),
            }
          : i,
      ),
    );
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data) => {
    const returnItems = items.filter((i) => i.returnQty > 0);

    if (!purchase) {
      alert("Please select a purchase invoice");
      return;
    }
    if (!returnItems.length) {
      alert("No return items selected");
      return;
    }

    if (cashRefund + dueAdjust !== returnAmount) {
      alert("Cash refund + Due adjust must equal return amount");
      return;
    }

    const payload = {
      purchaseId: purchase._id,
      returnDate: data.returnDate,
      reason: data.reason,
      items: returnItems.map((i) => ({
        variantId: i.variantId,
        qty: i.returnQty,
      })),
      returnAmount,
      cashRefund,
      dueAdjust,
    };
    await request("/purchases/return", "POST", payload, {
      successMessage: "Purchase return completed successfully",
      onSuccess: () => {
        setPurchase(null);
        setItems([]);
      },
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-blue-600" />
                Purchase Return
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Return purchased items and manage supplier accounts
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{today()}</span>
            </div>
          </div>

          {/* Purchase Select Card */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 rounded-xl p-5 mb-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">
                Select Purchase Invoice
              </h2>
            </div>
            <PurchaseSelect onSelect={onSelectPurchase} />

            {purchase && (
              <div className="mt-4 p-3 bg-white/80 rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Invoice No:</span>
                    <span className="font-medium ml-2">
                      {purchase.invoiceNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Supplier:</span>
                    <span className="font-medium ml-2">
                      {purchase.supplier.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium ml-2">
                      {new Date(purchase.invoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Table Card */}
        {purchase && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Return Items</h3>
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {items.length} items
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Item Details
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Purchased Qty
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Return Qty
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Cost Price
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Return Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-800">
                          {item.label}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-700 font-medium">
                          {item.purchasedQty}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="number"
                          onWheel={(e) => e.currentTarget.blur()}
                          min={0}
                          max={item.purchasedQty}
                          value={item.returnQty}
                          onChange={(e) => updateQty(idx, e.target.value)}
                          className="w-24 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none transition-all text-center"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-700 font-medium">
                          {item.costPrice}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-blue-600">
                          {item.returnQty * item.costPrice}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary & Notes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-linear-to-br from-orange-50 to-amber-50/50 border border-orange-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-orange-600" />
                Return Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                  <span className="text-gray-600">Return Amount:</span>
                  <span className="text-xl font-bold text-gray-800">
                    {returnAmount}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Cash Refund:</span>
                  <span className="font-medium text-green-600">
                    {cashRefund}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Due Adjust:</span>
                  <span className="font-medium text-blue-600">{dueAdjust}</span>
                </div>

                <div className="pt-4 border-t border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Balance Check:
                    </span>
                    <span
                      className={`text-lg font-bold ${cashRefund + dueAdjust === returnAmount ? "text-green-600" : "text-red-600"}`}
                    >
                      {cashRefund + dueAdjust === returnAmount
                        ? "✓ Balanced"
                        : "✗ Imbalanced"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Cash Refund + Due Adjust = Return Amount
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="lg:col-span-2">
            <div className="bg-linear-to-br from-violet-50 to-indigo-50/50 border border-violet-100 rounded-xl p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-gray-800">Return Reason</h3>
              </div>

              <textarea
                {...register("reason", { required: true })}
                placeholder="Enter return reason (damaged, defective, wrong item, etc.)..."
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/80 text-gray-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
              />

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>This reason will be recorded in the return history</span>
              </div>
            </div>
          </div>
        </div>

        {/* Return Details Card */}
        <div className="bg-linear-to-r from-emerald-50 to-teal-50/50 rounded-xl p-5 mb-6 border border-emerald-100">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-800">Return Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  {...register("returnDate", { required: true })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Refund
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                <input
                  {...register("cashRefund")}
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Due Adjust
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register("dueAdjust")}
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setPurchase(null);
                setItems([]);
              }}
              className="px-6 py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Clear All
            </button>

            <button
              type="submit"
              disabled={!purchase || items.every((i) => i.returnQty === 0)}
              className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                !purchase || items.every((i) => i.returnQty === 0)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              {"Confirm Return"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------------- PURCHASE SELECT ---------------- */
function PurchaseSelect({ onSelect }) {
  const { request } = useApi();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPurchases = async () => {
      setLoading(true);
      try {
        const res = await request("/purchases?limit=20", "GET");
        setList(res?.data || []);
      } catch (error) {
        console.error("Error loading purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [request]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <select
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading}
        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="" className="text-gray-400">
          {loading ? "Loading invoices..." : "Select purchase invoice"}
        </option>
        {list.map((p) => (
          <option key={p._id} value={p._id} className="text-gray-800">
            {p.purchaseNo}- {p.invoiceNumber} - {p.supplierName} -{" "}
            {new Date(p.invoiceDate).toLocaleDateString()}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

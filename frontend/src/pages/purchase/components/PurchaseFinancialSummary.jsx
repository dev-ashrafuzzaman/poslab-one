import { ArrowRight, Loader2 } from "lucide-react";

export default function PurchaseFinancialSummary({
  itemCount,
  financialSummary,
  paymentHook,
  loading,
  reset,
}) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-4 shadow-sm sticky top-4 font-mono select-none">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 font-sans">
        Invoice Financial Breakdown
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center text-gray-600">
          <span>Total Item Rows:</span>
          <span className="font-bold text-xl text-gray-900">{itemCount}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>Sub-Total (Products):</span>
          <span className="font-bold text-xl text-gray-900">
            {Number(financialSummary.subTotal.toFixed(2)).toLocaleString(
              "en-IN",
            )}{" "}
            ৳
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>Shipping / Logistics:</span>
          <span className="font-bold text-xl text-amber-600">
            (+){" "}
            {Number(
              (financialSummary.grandTotal - financialSummary.subTotal).toFixed(
                2,
              ),
            ).toLocaleString("en-IN")}{" "}
            ৳
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-2 text-gray-900">
          <span className="font-bold text-xs uppercase font-sans">
            Grand Total Cost:
          </span>
          <span className="text-xl font-black text-emerald-600">
            {Number(financialSummary.grandTotal.toFixed(2)).toLocaleString(
              "en-IN",
            )}{" "}
            ৳
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-600 border-t border-gray-100 pt-2">
          <span>Ledger Paid Amount:</span>
          <span className="font-bold text-xl text-blue-600">
            {Number(paymentHook.paidAmount.toFixed(2)).toLocaleString("en-IN")}{" "}
            ৳
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-2">
          <span className="font-bold text-xs uppercase text-gray-700 font-sans">
            Net Due Ledger:
          </span>
          <span
            className={`text-xl font-black ${paymentHook.remaining > 0 ? "text-red-600" : "text-gray-400"}`}
          >
            {Number(paymentHook.remaining.toFixed(2)).toLocaleString("en-IN")} ৳
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col gap-2 font-sans">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Processing Invoice
              Ledger...
            </>
          ) : (
            <>
              Post Purchase Invoice <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to completely flush and reset this procurement worksheet sheet layout contents?",
              )
            ) {
              reset();
              paymentHook.resetPayment();
            }
          }}
          className="text-center text-xs text-gray-400 hover:text-red-600 transition-colors py-2 font-medium"
        >
          Reset Invoice & Flush Gate
        </button>
      </div>
    </div>
  );
}

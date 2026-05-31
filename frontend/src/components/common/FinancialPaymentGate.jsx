import React from "react";
import { X, Plus, AlertCircle, Receipt, Wallet, CornerDownLeft, ArrowRightLeft } from "lucide-react";
import Button from "../ui/Button";
import ReportSmartSelect from "./ReportSmartSelect";
import Input from "../ui/Input";

export default function FinancialPaymentGate({
  paymentHookData,
  parentAccountCode = "1002",
  showReceiptFooter = false,
}) {
  const {
    payments = [],
    addPayment,
    removePayment,
    updatePayment,
    remaining = 0,
    changeAmount = 0,
  } = paymentHookData;

  // Remaining ব্যালেন্স সরাসরি ইনপুট বক্সে পুশ করার জন্য প্রফেশনাল শর্টকাট মেথড
  const handleApplyRemaining = (index) => {
    if (remaining <= 0) return;
    
    // কারেন্ট ইনপুটে থাকা ভ্যালু এবং রিমেট ব্যালেন্স একসাথে যোগ করে সেট করা
    const currentInputValue = parseFloat(payments[index]?.amount) || 0;
    const computedMaxTarget = currentInputValue + remaining;
    
    updatePayment(index, "amount", Number(computedMaxTarget.toFixed(2)).toString());
  };

  return (
    <div className="space-y-6">
      {/* ---------------- SECTION HEADER ---------------- */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Multi-Account Accounting Allocation
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Distribute total invoice transaction weight among financial asset ledgers
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={addPayment}
          size="sm"
          variant="outline"
          className="flex items-center gap-1.5 h-8 text-xs font-semibold border-blue-200 bg-blue-50/30 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Split Payment Asset
        </Button>
      </div>

      {/* ---------------- PAYMENTS GRID ENTRIES ---------------- */}
      <div className="space-y-3 max-h-85 overflow-y-auto pr-1 scrollbar-thin">
        {payments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/40 border border-dashed border-gray-200 rounded-xl select-none">
            <p className="text-xs text-gray-400 font-medium">
              No asset payment vectors assigned. Voucher will be posted as 100% Credit/Due.
            </p>
            <button
              type="button"
              onClick={addPayment}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              Initialize First Ledger Row <CornerDownLeft className="size-3" />
            </button>
          </div>
        ) : (
          payments.map((p, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm transition-all rounded-xl p-3"
            >
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* ACCOUNT SELECTOR (5 COLUMNS) */}
                <div className="col-span-12 md:col-span-5 flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 select-none">
                    Asset / Ledger Account Link
                  </span>
                  <ReportSmartSelect
                    route="accounts/payment-methods"
                    extraParams={{ parentCode: parentAccountCode }}
                    displayField={["name", "code"]}
                    valueField="_id"
                    placeholder="Search Bank/Cash General Ledger..."
                    value={
                      p.accountId
                        ? {
                            _id: p.accountId,
                            name: p.method,
                            code: p.raw?.code || "",
                          }
                        : null
                    }
                    onChange={(selectedItem) => {
                      if (!selectedItem) {
                        updatePayment(index, "accountId", "");
                        updatePayment(index, "method", "");
                        updatePayment(index, "raw", null);
                        return;
                      }

                      updatePayment(index, "accountId", selectedItem._id);
                      updatePayment(index, "method", selectedItem.name);
                      updatePayment(index, "raw", selectedItem);

                      // Auto reference code rules context alignment
                      if (
                        selectedItem.code === "1001" ||
                        selectedItem.name?.toLowerCase().includes("cash")
                      ) {
                        updatePayment(index, "reference", "Counter Cash Settlement");
                      } else {
                        updatePayment(index, "reference", "");
                      }
                    }}
                  />
                </div>

                {/* AMOUNT DISBURSEMENT WITH QUICK MAX UX SHORTCUT (3 COLUMNS) */}
                <div className="col-span-12 sm:col-span-6 md:col-span-3 flex flex-col">
                  <div className="flex justify-between items-center mb-1 select-none">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Allocated Capital
                    </span>
                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => handleApplyRemaining(index)}
                        className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all scale-95"
                        title="Auto-fill with remaining voucher balance"
                      >
                        Apply Remaining
                      </button>
                    )}
                  </div>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[10px] font-bold text-gray-400 select-none">
                      BDT
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onWheel={(e) => e.currentTarget.blur()}
                      value={p.amount}
                      onChange={(e) => updatePayment(index, "amount", e.target.value)}
                      inputClassName="pl-11 text-right font-mono font-bold text-gray-900 h-10 text-sm rounded-lg focus:ring-blue-100 focus:border-blue-500 border-gray-300"
                      className="m-0"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* TRANSACTION REFERENCE / REMARK TRACKER (3 COLUMNS) */}
                <div className="col-span-12 sm:col-span-5 md:col-span-3 flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 select-none">
                    Reference / Voucher Note
                  </span>
                  <Input
                    value={p.reference}
                    onChange={(e) => updatePayment(index, "reference", e.target.value)}
                    placeholder="TxID, Cheque No, Slip Code..."
                    inputClassName="h-10 text-sm rounded-lg border-gray-300 focus:ring-gray-100 focus:border-gray-400 text-gray-700 font-medium"
                    className="m-0"
                  />
                </div>

                {/* ROW ACTION DESTRUCTOR (1 COLUMN) */}
                <div className="col-span-12 sm:col-span-1 md:col-span-1 flex md:justify-end justify-center items-center h-full pt-4">
                  {payments.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removePayment(index)}
                      className="w-9 h-10 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-gray-200 hover:border-rose-100 shadow-2xs active:scale-95"
                      title="Purge transaction ledger mapping row"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  ) : (
                    <div className="w-9 h-10 hidden md:block" /> // Layout structural placeholder mirroring consistency
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---------------- DYNAMIC SUMMARY ACCOUNTING FOOTERS ---------------- */}
      <div className="space-y-2 select-none">
        {remaining > 0 && (
          <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold font-mono">
                Outstanding Remaining Due: BDT {Number(remaining.toFixed(2)).toLocaleString("en-IN")}
              </span>
              . This unallocated capital margin will automatically be captured as a **Accounts Payable (Liabilities)** balancing record directly on the designated Supplier's control ledger profile.
            </div>
          </div>
        )}

        {changeAmount > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-xs transition-all animate-fadeIn">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900">
                Cash Operational Capital Return Change:
              </span>
            </div>
            <span className="text-sm font-mono font-black text-emerald-700 bg-white border border-emerald-100 px-2.5 py-0.5 rounded-md shadow-2xs">
              BDT {Number(changeAmount.toFixed(2)).toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {showReceiptFooter && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400 italic pt-2 border-t border-gray-100">
            <Receipt className="w-3.5 h-3.5 text-gray-400" />
            <span>
              Thermal hardware spool configuration confirmed. General accounting double-entry matrices initialized.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
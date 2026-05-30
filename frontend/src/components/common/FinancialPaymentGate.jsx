import React from "react";
import { X, Plus, AlertCircle, Receipt, Wallet } from "lucide-react";
import Button from "../ui/Button";
import ReportSmartSelect from "./ReportSmartSelect";
import Input from "../ui/Input";

export default function FinancialPaymentGate({
  paymentHookData,
  parentAccountCode = "1002",
  showReceiptFooter = false,
}) {
  const {
    payments,
    addPayment,
    removePayment,
    updatePayment,
    remaining,
    changeAmount,
  } = paymentHookData;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-800">
            Payment Method Allocation
          </h3>
        </div>
        <Button
          type="button"
          onClick={addPayment}
          size="sm"
          variant="outline"
          className="flex items-center gap-1.5 h-8 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Multi-Method Row
        </Button>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {payments.map((p, index) => (
          <div
            key={index}
            className="bg-gray-50/50 border border-gray-200 hover:border-gray-300 transition-all rounded-xl p-3.5"
          >
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5">
                <ReportSmartSelect
                  route="accounts/payment-methods"
                  extraParams={{
                    parentCode: parentAccountCode,
                  }}
                  displayField={["name", "code"]}
                  valueField="_id"
                  placeholder="Select Asset/Bank Account"
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

                    if (
                      selectedItem.code === "1001" ||
                      selectedItem.name?.toLowerCase().includes("cash")
                    ) {
                      updatePayment(index, "reference", "Counter Cash Trade");
                    } else {
                      updatePayment(index, "reference", "");
                    }
                  }}
                />
              </div>

              <div className="col-span-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-400">
                    BDT
                  </span>
                  <Input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={p.amount}
                    onChange={(e) =>
                      updatePayment(index, "amount", e.target.value)
                    }
                    inputClassName="pl-11 text-right font-bold text-gray-800 h-10 text-sm rounded-lg"
                    className="m-0"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="col-span-4">
                <Input
                  value={p.reference}
                  onChange={(e) =>
                    updatePayment(index, "reference", e.target.value)
                  }
                  placeholder="TxID / Card Slip"
                  inputClassName="h-10 text-sm rounded-lg"
                  className="m-0"
                />
              </div>

              <div className="col-span-1 flex justify-end pt-5.5">
                {payments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePayment(index)}
                    className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-3">
          <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">
              Outstanding Remaining Balance: BDT {remaining}
            </span>
            . This unpaid portion will automatically manifest as general
            credit/ledger inside the Client/Supplier's ledger matrix.
          </div>
        </div>
      )}

      {changeAmount > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <span className="text-xs font-semibold text-emerald-800">
            Cash Return Change:
          </span>
          <span className="text-sm font-black text-emerald-700">
            BDT {changeAmount}
          </span>
        </div>
      )}

      {showReceiptFooter && (
        <div className="flex items-center gap-2 text-xs text-gray-400 italic pt-1 border-t border-gray-100">
          <Receipt className="w-3.5 h-3.5 text-gray-400" />
          <span>
            Thermal raw print service initialized. Invoice compilation in queue.
          </span>
        </div>
      )}
    </div>
  );
}
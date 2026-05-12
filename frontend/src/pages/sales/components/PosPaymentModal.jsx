import { useEffect, useRef } from "react";
import {
  X,
  Plus,
  Check,
  Wallet,
  AlertCircle,
  CreditCard,
  Receipt,
} from "lucide-react";
import usePosPayment from "./usePosPayment";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import SmartSelect from "../../../components/common/SmartSelect";

export default function PosPaymentModal({
  open,
  totalAmount,
  onClose,
  onConfirm,
}) {
  const firstSelectRef = useRef(null);
  const {
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
  } = usePosPayment(totalAmount);

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      firstSelectRef.current?.focus?.();
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      const el = document.activeElement;
      const tag = el?.tagName;

      /* ENTER inside input → next field */
      if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
        if (tag === "INPUT" || tag === "TEXTAREA") {
          e.preventDefault();

          const focusables = Array.from(
            document.querySelectorAll(
              'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => !el.disabled);

          const idx = focusables.indexOf(el);
          focusables[idx + 1]?.focus();
          return;
        }
      }

      /* CTRL + ENTER or SHIFT + ENTER → Confirm */
      if (
        (e.ctrlKey && e.key === "Enter") ||
        (e.shiftKey && e.key === "Enter")
      ) {
        e.preventDefault();
        if (!isValid || remaining > 0) return;
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isValid, remaining, payments]);

  const handleConfirm = () => {
    if (!isValid || remaining > 0) return;
    onConfirm(payments, resetPayment);
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      setIsOpen={onClose}
      title="Payment Processing"
      size="2xl"
      closeOnOverlayClick={false}
      closeOnEsc={false}
      footer={
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Receipt className="w-4 h-4" />
            <span>Receipt will be printed automatically</span>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>

            <Button
              disabled={!isValid || remaining > 0}
              onClick={handleConfirm}
              variant="gradient"
              className="px-8">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Confirm Sale
              </div>
            </Button>
          </div>
        </div>
      }>
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                BDT {totalAmount}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Paid Amount</div>
              <div className="text-2xl font-bold text-green-600">
                BDT {paidAmount}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Remaining</div>
              <div
                className={`text-2xl font-bold BDT {remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                BDT {remaining}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Payment Methods
            </h3>
            <Button
              onClick={addPayment}
              size="sm"
              variant="outline"
              className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Payment
            </Button>
          </div>

          <div className="space-y-4 max-h-75 overflow-y-auto pr-2">
            {payments.map((p, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Payment Method */}
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Method
                    </label>
                    <SmartSelect
                      ref={index === 0 ? firstSelectRef : null}
                      customRoute="/sales/payment-methods"
                      displayField={["name", "code"]}
                      idField="_id"
                      preLoad
                      pageSize={10}
                      extraParams={{
                        parentCode: "1002",
                        sort: "cash_first",
                      }}
                      placeholder="Select method"
                      value={
                        p.accountId
                          ? {
                              value: p.accountId,
                              label: p.method,
                              raw: p.raw,
                            }
                          : null
                      }
                      onChange={(opt) => {
                        if (!opt) {
                          markManualClear(index);
                          updatePayment(index, "accountId", "");
                          updatePayment(index, "method", "");
                          updatePayment(index, "raw", null);
                          return;
                        }

                        clearManualClear(index);
                        updatePayment(index, "accountId", opt.value);
                        updatePayment(index, "method", opt.raw.name);
                        updatePayment(index, "raw", opt.raw);
                      }}
                    />
                  </div>

                  {/* Amount */}
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        BDT{" "}
                      </span>
                      <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        value={p.amount}
                        onChange={(e) =>
                          updatePayment(index, "amount", e.target.value)
                        }
                        inputClassName="pl-8 text-right"
                        className="m-0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference
                    </label>
                    <Input
                      value={p.method === "Cash" ? "Cash" : p.reference}
                      onChange={(e) =>
                        updatePayment(index, "reference", e.target.value)
                      }
                      placeholder="Reference"
                      className="m-0"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex justify-end">
                    {payments.length > 1 && (
                      <button
                        onClick={() => removePayment(index)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Message - Due System Disabled */}
        {remaining > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-amber-800">
                  Full Payment Required
                </div>
                <div className="text-sm text-amber-700 mt-1">
                  Due system is disabled. Please add payment to cover the
                  remaining BDT {remaining}.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Amount */}
        {changeAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-green-800">Change Amount</div>
              <div className="text-lg font-bold text-green-700">
                BDT {changeAmount}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

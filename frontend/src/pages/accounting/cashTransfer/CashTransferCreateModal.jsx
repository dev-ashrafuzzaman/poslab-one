import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Loader2,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function CashTransferCreateModal({
  isOpen,
  setIsOpen,
  refetch,
}) {
  const { request } = useApi();
  const [availableCash, setAvailableCash] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      amount: "",
      narration: "",
    },
  });

  const amount = watch("amount");
  const exceedsLimit = Number(amount) > availableCash;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({ amount: "", narration: "" });
      setShowConfirm(false);
      setFormData(null);

      request("/cash-transfer/branch-cash", "GET", null, {
        showSuccessToast: false,
        onSuccess: (res) => {
          setAvailableCash(res.availableCash || 0);
        },
      });
    }
  }, [isOpen, reset, request]);

  const handleFormSubmit = (data) => {
    if (Number(data.amount) > availableCash) return;
    setFormData(data);
    setShowConfirm(true);
  };

  const handleConfirmTransfer = async () => {
    if (!formData) return;

    await request("/cash-transfer", "POST", formData, {
      successMessage: "Cash transfer created successfully",
      onSuccess: () => {
        setShowConfirm(false);
        setIsOpen(false);
        refetch();
      },
    });
  };

  const handleClose = () => {
    setShowConfirm(false);
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={showConfirm ? "Confirm Transfer" : "Create Cash Transfer"}
      subTitle={
        showConfirm
          ? "Please review the transfer details"
          : "Transfer branch cash to Main Warehouse"
      }
      size="xl"
      onClose={handleClose}
      footer={
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-700"
          >
            Cancel
          </Button>

          {!showConfirm ? (
            <Button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={!isValid || exceedsLimit || !amount}
              className="min-w-35"
            >
              <>
                Continue
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </>
            </Button>
          ) : (
            <Button
              onClick={handleConfirmTransfer}
              className="min-w-35 bg-green-600 hover:bg-green-700"
            >
              <>
                Confirm Transfer
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            </Button>
          )}
        </div>
      }
    >
      {!showConfirm ? (
        // Create Form View
        <div className="space-y-6">
          {/* Available Cash Card */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50/50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Available Branch Cash
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ৳ {availableCash.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-white/60 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Input
              type="number"
              label="Transfer Amount"
              placeholder="Enter amount in BDT"
              error={errors.amount?.message}
              className={
                exceedsLimit && amount
                  ? "border-red-300 focus:border-red-500"
                  : ""
              }
              {...register("amount", {
                required: "Amount is required",
                min: { value: 1, message: "Amount must be greater than 0" },
                max: {
                  value: availableCash,
                  message: `Amount cannot exceed ৳${availableCash.toLocaleString()}`,
                },
              })}
            />

            {/* Validation Messages */}
            {amount && (
              <div className="flex items-center gap-2 text-sm">
                {exceedsLimit ? (
                  <>
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">
                      Exceeds available cash by ৳
                      {(Number(amount) - availableCash).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Valid amount</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Narration */}
          <div>
            <Input
              label="Narration (Optional)"
              placeholder="Add a note for this transfer"
              {...register("narration")}
            />
            <p className="mt-1 text-xs text-gray-500">
              This note will be visible in the transfer history
            </p>
          </div>

          {/* Quick Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Transfer Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transfer Amount</span>
                <span className="font-medium text-gray-900">
                  {amount ? `৳ ${Number(amount).toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining Balance</span>
                <span className="font-medium text-gray-900">
                  {amount
                    ? `৳ ${(availableCash - Number(amount)).toLocaleString()}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Confirmation View
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Ready to Transfer?
            </h3>
            <p className="text-sm text-gray-500">
              Please verify the details before confirming
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Transfer Amount</span>
              <span className="text-xl font-bold text-gray-900">
                ৳ {Number(formData?.amount).toLocaleString()}
              </span>
            </div>

            {formData?.narration && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Narration</span>
                <span className="text-sm font-medium text-gray-900">
                  {formData.narration}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Available After Transfer
              </span>
              <span className="text-sm font-medium text-green-600">
                ৳{" "}
                {(
                  availableCash - Number(formData?.amount || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <p className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                This action will transfer funds from branch cash to Main
                Warehouse. Please ensure all details are correct.
              </span>
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

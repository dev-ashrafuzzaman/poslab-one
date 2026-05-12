import { useState } from "react";
import {
  CheckCircle,
  ArrowDownToLine,
  AlertCircle,
  Calendar,
  Hash,
  Building2,
  FileText,
  Clock,
} from "lucide-react";

import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import useApi from "../../../hooks/useApi";

const CashTransferReceiveModal = ({ isOpen, setIsOpen, transfer, refetch }) => {
  console.log(transfer);
  const { request, loading } = useApi();
  const [step, setStep] = useState("confirm"); // confirm, processing, success

  const handleConfirm = async () => {
    setStep("processing");

    await request(
      `/cash-transfer/${transfer._id}/receive`,
      "PATCH",
      {},
      {
        successMessage: "Cash received successfully",
        onSuccess: () => {
          setStep("success");
          setTimeout(() => {
            setIsOpen(false);
            refetch();
            setStep("confirm");
          }, 1500);
        },
        onError: () => {
          setStep("confirm");
        },
      },
    );
  };

  const handleClose = () => {
    setStep("confirm");
    setIsOpen(false);
  };

  if (!transfer) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={
        step === "success"
          ? "Transfer Received!"
          : step === "processing"
            ? "Processing Transfer"
            : "Confirm Cash Receive"
      }
      subTitle={
        step === "success"
          ? "The funds have been added to your branch"
          : step === "processing"
            ? "Please wait while we process your request"
            : "Please verify the transfer details before confirming"
      }
      size="xl"
      onClose={handleClose}
      footer={
        step === "confirm" && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="min-w-40 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Confirm Receive
            </Button>
          </div>
        )
      }
    >
      {/* Success State */}
      {step === "success" && (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Transfer Completed!
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            ৳ {transfer.amount.toLocaleString()} has been received
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Closing automatically...</span>
          </div>
        </div>
      )}

      {/* Processing State */}
      {step === "processing" && (
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Processing your transfer...
          </p>
        </div>
      )}

      {/* Confirm State */}
      {step === "confirm" && (
        <div className="space-y-5">
          {/* Header Amount Card */}
          <div className="bg-linear-to-br from-green-50 to-emerald-50/50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">
                  Transfer Amount
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ৳ {transfer.amount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/60 rounded-xl">
                <ArrowDownToLine className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Transfer Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Hash className="w-3 h-3" />
                <span>Transfer Code</span>
              </div>
              <p className="text-sm font-medium text-gray-900 font-mono">
                {transfer.transferCode}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Building2 className="w-3 h-3" />
                <span>From Branch</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {transfer.fromBranchName}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span>Initiated</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {transfer.createdAt}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <AlertCircle className="w-3 h-3" />
                <span>Status</span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}
              >
                {transfer.status}
              </span>
            </div>
          </div>

          {/* Narration (if exists) */}
          {transfer.narration && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <FileText className="w-3 h-3" />
                <span>Narration</span>
              </div>
              <p className="text-sm text-gray-700">{transfer.narration}</p>
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-amber-50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">Verify before receiving</p>
              <p className="text-amber-600">
                Once confirmed, the amount will be added to your branch cash
                balance. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>Transaction ID: {transfer._id.slice(-8)}</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              {transfer.type}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CashTransferReceiveModal;

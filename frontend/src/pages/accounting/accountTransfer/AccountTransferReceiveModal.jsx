import { useState } from "react";
import {
  CheckCircle,
  ArrowRightLeft,
  AlertCircle,
  Calendar,
  Hash,
  Building2,
  FileText,
  Clock,
  CreditCard,
} from "lucide-react";

import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import useApi from "../../../hooks/useApi";

const AccountTransferReceiveModal = ({
  isOpen,
  setIsOpen,
  transfer,
  refetch,
}) => {
  const { request, loading } = useApi();
  const [step, setStep] = useState("confirm");
  const [verified, setVerified] = useState(false);
  const handleConfirm = async () => {
    setStep("processing");

    await request(
      `/account-transfer/${transfer._id}/approve`,
      "PATCH",
      {},
      {
        successMessage: "Account transfer approved successfully",
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
    setVerified(false);
    setStep("confirm");
    setIsOpen(false);
  };

  if (!transfer) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const total = Number(transfer.amount || 0) + Number(transfer.charge || 0);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={
        step === "success"
          ? "Transfer Approved!"
          : step === "processing"
            ? "Processing Transfer"
            : "Confirm Account Transfer"
      }
      subTitle={
        step === "success"
          ? "Funds have been transferred successfully"
          : step === "processing"
            ? "Please wait while we process your request"
            : "Verify account transfer details before approving"
      }
      size="xl"
      onClose={handleClose}
      footer={
        step === "confirm" && (
          <div className="flex items-center justify-between pt-4">
            {/* Verify Checkbox */}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              I have verified this transfer
            </label>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>

              <Button
                onClick={handleConfirm}
                disabled={!verified || loading}
                className="min-w-40 bg-green-600 hover:bg-green-700"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Approve Transfer
              </Button>
            </div>
          </div>
        )
      }
    >
      {/* SUCCESS */}
      {step === "success" && (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Transfer Completed
          </h3>

          <p className="text-sm text-gray-500">
            ৳ {transfer.amount.toLocaleString()} transferred successfully
          </p>

          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <Clock className="w-3 h-3" />
            <span>Closing automatically...</span>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {step === "processing" && (
        <div className="py-8 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>

          <p className="mt-4 text-sm text-gray-600">Processing transfer...</p>
        </div>
      )}

      {/* CONFIRM */}
      {step === "confirm" && (
        <div className="space-y-5">
          {/* Amount Card */}
          <div className="bg-green-50 rounded-xl p-5 border">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Transfer Amount</span>

              <span className="text-2xl font-bold">
                ৳ {transfer.amount.toLocaleString()}
              </span>
            </div>

            {transfer.charge > 0 && (
              <div className="flex justify-between mt-2 text-sm">
                <span>Charge</span>
                <span>৳ {transfer.charge}</span>
              </div>
            )}

            <div className="flex justify-between border-t pt-2 mt-2 font-medium">
              <span>Total Deduct</span>
              <span>৳ {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Hash className="w-3 h-3" />
                Transfer Code
              </div>
              <p className="text-sm font-medium">{transfer.transferCode}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Calendar className="w-3 h-3" />
                Created
              </div>
              <p className="text-sm">{transfer.createdAt}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Building2 className="w-3 h-3" />
                From Branch
              </div>
              <p className="text-sm font-medium">{transfer.fromBranchName}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Building2 className="w-3 h-3" />
                To Branch
              </div>
              <p className="text-sm font-medium">{transfer.toBranchName}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <CreditCard className="w-3 h-3" />
                From Account
              </div>
              <p className="text-sm font-medium">{transfer.fromAccountName}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <CreditCard className="w-3 h-3" />
                To Account
              </div>
              <p className="text-sm font-medium">{transfer.toAccountName}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <AlertCircle className="w-3 h-3" />
                Status
              </div>

              <span
                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                  transfer.status,
                )}`}
              >
                {transfer.status}
              </span>
            </div>
          </div>

          {/* Narration */}
          {transfer.narration && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <FileText className="w-3 h-3" />
                Narration
              </div>

              <p className="text-sm">{transfer.narration}</p>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />

            <div className="text-sm text-amber-700">
              <p className="font-medium">Verify before approving</p>
              <p>
                This action will post accounting journal entry and cannot be
                undone.
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AccountTransferReceiveModal;

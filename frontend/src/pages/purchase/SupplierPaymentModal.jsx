import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/modals/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import SmartSelect from "../../components/common/SmartSelect";
import useApi from "../../hooks/useApi";
import ReportSmartSelect from "../../components/common/ReportSmartSelect";

export default function SupplierPaymentModal({
  isOpen,
  setIsOpen,
  refetch,
  purchase,
}) {
  const { request, loading } = useApi();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      paymentAccount: null,
      confirm: false,
    },
  });

  const payAmount = watch("amount");

  /* 🔄 Reset when modal opens */
  useEffect(() => {
    if (isOpen) {
      reset({
        amount: "",
        paymentAccount: null,
        confirm: false,
      });
    }
  }, [isOpen, reset]);

  /* =========================
     SUBMIT
  ========================== */
  const onSubmit = async (data) => {
    if (!purchase) return;

    const amount = Number(data.amount);

    if (amount <= 0) {
      setError("amount", {
        type: "manual",
        message: "Invalid payment amount",
      });
      return;
    }

    if (amount > purchase.dueAmount) {
      setError("amount", {
        type: "manual",
        message: "Payment cannot exceed due amount",
      });
      return;
    }

    const payload = {
      purchaseId: purchase._id,
      amount,
      paymentAccountId: data.paymentAccount?._id,
    };

    await request("/purchases/supplier-payments", "POST", payload, {
      successMessage: "Supplier payment successful",
      onSuccess: () => {
        setIsOpen(false);
        refetch?.();
      },
    });
  };

  if (!purchase) return null;

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Supplier Payment"
      subTitle={`Invoice: ${purchase.purchaseNo}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            variant="gradient"
          >
            Confirm Payment
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* =====================
            PURCHASE SUMMARY
        ====================== */}
        <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
          <div>
            <p className="text-gray-500">Total Amount</p>
            <p className="font-semibold text-gray-800">
              ৳ {purchase.totalAmount}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Already Paid</p>
            <p className="font-semibold text-green-600">
              ৳ {purchase.paidAmount}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Due Amount</p>
            <p className="font-semibold text-red-600">৳ {purchase.dueAmount}</p>
          </div>
        </div>

        {/* =====================
            PAYMENT INPUT
        ====================== */}
        <div>
          <Input
            type="number"
            label="Pay Amount"
            placeholder="Enter amount"
            error={errors.amount?.message}
            {...register("amount", {
              required: "Payment amount required",
            })}
          />

          {payAmount && (
            <p className="text-xs text-gray-500 mt-1">
              Remaining after payment: ৳{" "}
              {Math.max(purchase.dueAmount - Number(payAmount || 0), 0)}
            </p>
          )}
        </div>

        {/* =====================
            ACCOUNT SELECT
        ====================== */}

        <Controller
          name="paymentAccount"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Account
              </label>
              <ReportSmartSelect
                route="/sales/payment-methods"
                extraParams={{
                  parentCode: "1002",
                  sort: "cash_first",
                }}
                displayField={["name", "code"]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Payment Method"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}
        />

        {/* =====================
            CONFIRMATION
        ====================== */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("confirm", {
              required: "You must confirm this payment",
            })}
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-600">
            I confirm this supplier payment
          </label>
        </div>

        {errors.confirm && (
          <p className="text-sm text-red-500">{errors.confirm.message}</p>
        )}
      </div>
    </Modal>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function LoyaltySettingUpdateModal({
  isOpen,
  setIsOpen,
  refetch,
  row, // 🔥 selected row
}) {
  const { request, loading } = useApi();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  /* ---------------- Prefill ---------------- */
  useEffect(() => {
    if (row) {
      reset({
        maxRewardValue: row.maxRewardValue,
        minActivationAmount: row.minActivationAmount,
        minDailyPurchase: row.minDailyPurchase,
        requiredCount: row.requiredCount,
        productDiscountPercent: row.productDiscountPercent,
      });
    }
  }, [row, reset]);

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data) => {
    await request("/memberships/loyalty", "PUT", data, {
      successMessage: "Loyalty settings updated",
      onSuccess: () => {
        setIsOpen(false);
        refetch();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Update Loyalty Settings"
      subTitle="Configure membership & loyalty rules"
      size="xl"
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
            Update
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Membership Product Discount (%)"
          type="number"
          onWheel={(e) => e.currentTarget.blur()}
          {...register("productDiscountPercent", { min: 0, max: 100 })}
        />

        <Input
          label="Min Activation Amount"
          type="number"
          onWheel={(e) => e.currentTarget.blur()}
          {...register("minActivationAmount", { required: true })}
        />

        <Input
          label="Min Daily Purchase"
          type="number"
          onWheel={(e) => e.currentTarget.blur()}
          {...register("minDailyPurchase", { required: true })}
        />

        <Input
          label="Required Purchase Count"
          type="number"
          onWheel={(e) => e.currentTarget.blur()}
          {...register("requiredCount", { required: true })}
        />

        <Input
          label="Max Reward Value"
          type="number"
          onWheel={(e) => e.currentTarget.blur()}
          {...register("maxRewardValue", { required: true })}
        />
      </div>
    </Modal>
  );
}

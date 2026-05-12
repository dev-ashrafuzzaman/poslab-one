import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../hooks/useApi";
import Modal from "../../components/modals/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function PartyCreateModal({
  config,
  isOpen,
  setIsOpen,
  refetch,
  onSuccess,
}) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: config.type,
      name: "",
      phone: "",
      email: "",
      address: "",
      openingBalance: 0,
      commissionPercent: 0,
      creditLimit: 0,
      notes: "",
      status: "active",
    },
  });

  /* ================= SUBMIT ================= */

  const onSubmit = async (data) => {
    await request(
      "/parties",
      "POST",
      data,

      {
        successMessage: `${config.title} created successfully`,
        onSuccess: (res) => {
          reset();
          setIsOpen(false);
          onSuccess?.(res?.data);
          refetch?.();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={config.modalTitle}
      subTitle={`Create new ${config.type}`}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            variant="gradient"
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Name"
          placeholder="Enter name"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
          })}
        />

        <Input
          label="Phone"
          placeholder="017XXXXXXXX"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone is required",

            pattern: {
              value: /^(01)[0-9]{9}$/,

              message: "Invalid Bangladesh phone",
            },
          })}
        />

        <Input
          label="Email"
          placeholder="email@example.com"
          {...register("email")}
        />

        <Input label="Address" placeholder="Address" {...register("address")} />

        <Input
          label="Opening Balance"
          type="number"
          {...register("openingBalance")}
        />

        <Input
          label="Commission %"
          type="number"
          {...register("commissionPercent")}
        />

        <Input
          label="Credit Limit"
          type="number"
          {...register("creditLimit")}
        />

        <Input
          label="Notes"
          placeholder="Optional notes"
          {...register("notes")}
        />
      </div>
    </Modal>
  );
}

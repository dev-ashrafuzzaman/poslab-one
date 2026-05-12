import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../hooks/useApi";
import Modal from "../../components/modals/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function PartyEditModal({
  row,
  config,
  isOpen,
  setIsOpen,
  refetch,
}) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  /* ================= LOAD ================= */

  useEffect(() => {
    if (row) {
      reset({
        name: row.name || "",
        phone: row.phone || "",
        email: row.email || "",
        address: row.address || "",
        openingBalance: row.openingBalance || 0,
        commissionPercent: row.commissionPercent || 0,
        creditLimit: row.creditLimit || 0,
        notes: row.notes || "",
        status: row.status || "active",
      });
    }
  }, [row, reset]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data) => {
    await request(
      `/parties/info/${row._id}`,
      "PUT",
      data,

      {
        successMessage: `${config.title} updated successfully`,

        onSuccess: () => {
          setIsOpen(false);

          refetch?.();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={`Edit ${config.type}`}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Name"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
          })}
        />

        {/* PHONE DISABLED */}

        <Input label="Phone" disabled {...register("phone")} />

        <Input label="Email" {...register("email")} />

        <Input label="Address" {...register("address")} />

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

        <Input label="Notes" {...register("notes")} />
      </div>
    </Modal>
  );
}

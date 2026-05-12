import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function CompanyInfoEditModal({
  isOpen,
  setIsOpen,
  refetch,
  row,
}) {
  const { request, loading } = useApi();

  const { register, handleSubmit, reset } = useForm();

  /* 🔹 Prefill */
  useEffect(() => {
    if (row?.value) {
      reset({
        name: row.value.name,
        phone: row.value.phone,
        email: row.value.email,
        address: row.value.address,
        currency: row.value.currency,
        timezone: row.value.timezone,
      });
    }
  }, [row, reset]);

  /* 🔹 Submit */
  const onSubmit = async (data) => {
    await request(`/settings/company-info/${row._id}`, "PUT", data, {
      successMessage: "Company info updated",
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
      title="Update Company Info"
      subTitle="Manage system identity & business information"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            prefix={loading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            variant="gradient"
          >
            Update
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Company Name" {...register("name")} />
        <Input label="Phone" {...register("phone")} />
        <Input label="Email" {...register("email")} />
        <Input label="Address" {...register("address")} />
        <Input label="Currency" {...register("currency")} />
        <Input label="Timezone" {...register("timezone")} />
      </div>
    </Modal>
  );
}
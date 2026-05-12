import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function BranchCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      code: "",
      name: "",
      address: "",
      phone: "",
      altPhone: "",
    },
  });

  const onSubmit = async (data) => {
    await request("/branches", "POST", data, {
      retries: 2,
      successMessage: "Branch created successfully",
      onSuccess: () => {
        reset();
        setIsOpen(false);
        refetch();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add New Branch"
      subTitle="Create a new branch for your organization."
      size="xl"
      closeOnOverlayClick
      closeOnEsc
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            type="submit"
            variant="gradient">
            Create Branch
          </Button>
        </div>
      }>
      <div className="flex flex-col gap-4">
        <Input
          label="Code"
          placeholder="JG"
          error={errors.code?.message}
          {...register("code", {
            required: "Code is required",
          })}
        />

        <Input
          label="Branch Name"
          placeholder="Jhikargachha Branch"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
          })}
        />
        <Input
          label="Address"
          placeholder="Dimond Plaza, Jhikargachha, Jashore"
          error={errors.address?.message}
          {...register("address", {
            required: "Address is required",
          })}
        />
        <Input
          label="Phone"
          placeholder="01711234567"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone is required",
          })}
        />
        <Input
          label="AltPhone"
          placeholder="01711234567"
          error={errors.altPhone?.message}
          {...register("altPhone", {
            required: "altPhone is required",
          })}
        />
      </div>
    </Modal>
  );
}

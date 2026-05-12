// CategoryCreateModal.jsx
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

export default function WarrantyCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      durationDays: 0,
      type: "warranty",
    },
  });

  const onSubmit = async (data) => {
    await request("/utils/warranty", "POST", data, {
      successMessage: "Warranty created successfully",
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
      title="Add New Warranty"
      subTitle="Create Warranty with hierarchy support"
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
            Create
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Warranty"
          placeholder="7 Days Warranty"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
          })}
        />
        <Input
          label="Duration Days"
          placeholder="7"
          type="number"
          error={errors.name?.message}
          {...register("durationDays", {
            required: "Duration Days is required",
          })}
        />
      </div>
    </Modal>
  );
}

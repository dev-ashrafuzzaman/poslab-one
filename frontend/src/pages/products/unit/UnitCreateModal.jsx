// CategoryCreateModal.jsx
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

export default function UnitCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data) => {
    await request("/utils/unit", "POST", data, {
      successMessage: "Unit created successfully",
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
      title="Add New Unit"
      subTitle="Create Unit with hierarchy support"
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
          label="Unit Name"
          placeholder="PCS"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
          })}
        />
      </div>
    </Modal>
  );
}

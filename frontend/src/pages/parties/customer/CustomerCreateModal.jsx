import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function CustomerCreateModal({
  isOpen,
  setIsOpen,
  refetch,
  onSuccess
}) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    reset, 
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      status: "active",
    },
  });

  /* ================= SUBMIT ================= */
const onSubmit = async (data) => {
  await request("/customers", "POST", data, {
    retries: 2,
    successMessage: "Customer created successfully",
    onSuccess: (res) => {
      const newCustomer = res?.data; // 🔥 backend data

      reset();
      setIsOpen(false);

      onSuccess?.(newCustomer); // 🔥 auto-select in POS
      refetch?.();
    },
  });
};


  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add New Customer"
      subTitle="Create a customer profile with contact details."
      size="xl"
      closeOnOverlayClick
      closeOnEsc
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
            Create Customer
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        <Input
          label="Customer Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
            maxLength: {
              value: 100,
              message: "Name cannot exceed 100 characters",
            },
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
              message: "Invalid Bangladesh phone number",
            },
          })}
        />

        <Input
          label="Email (Optional)"
          type="email"
          placeholder="customer@email.com"
          error={errors.email?.message}
          {...register("email", {
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email address",
            },
          })}
        />

        <Input
          label="Address (Optional)"
          placeholder="House, Road, Area, City"
          error={errors.address?.message}
          {...register("address")}
        />

      </div>
    </Modal>
  );
}

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function SupplierCreateModal({
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
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      contact: {
        name: "",
        phone: "",
        email: "supply@gmail.com",
      },
    },
  });

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
    await request("/suppliers", "POST", data, {
      retries: 2,
      successMessage: "Supplier created successfully",
      onSuccess: () => {
        reset();
        setIsOpen(false);
        refetch?.();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add New Supplier"
      subTitle="Create supplier with contact and address information."
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
            Create Supplier
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* ================= SUPPLIER INFO ================= */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
          <h3 className="font-semibold text-lg mb-4">
            Supplier Information
          </h3>

          <Input
            label="Supplier Name"
            placeholder="ABC Traders"
            error={errors.name?.message}
            {...register("name", {
              required: "Supplier name is required",
            })}
          />

          <Input
            label="Address (Optional)"
            placeholder="Market, Area, City"
            error={errors.address?.message}
            {...register("address")}
          />
        </section>

        {/* ================= CONTACT INFO ================= */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">
            Contact Person
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Name"
              placeholder="John Doe"
              error={errors.contact?.name?.message}
              {...register("contact.name", {
                required: "Contact person name is required",
              })}
            />

            <Input
              label="Phone"
              placeholder="017XXXXXXXX"
              error={errors.contact?.phone?.message}
              {...register("contact.phone", {
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
              placeholder="supplier@email.com"
              error={errors.contact?.email?.message}
              {...register("contact.email", {
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email address",
                },
              })}
            />
          </div>
        </section>

      </div>
    </Modal>
  );
}

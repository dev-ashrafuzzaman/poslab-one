import { useForm } from "react-hook-form";
import { Loader2, UserCheck } from "lucide-react";

import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import SmartSelect from "../../../components/common/SmartSelect";

export default function MembershipCreateModal({
  isOpen,
  setIsOpen,
  onSuccess,
  refetch,
}) {
  const { request, loading } = useApi();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer: null,
    },
  });

  const customer = watch("customer");

  /* ================= SUBMIT ================= */
  const onSubmit = async () => {
    if (!customer) return;

    const res = await request(
      "/memberships",
      "POST",
      { customerId: customer._id },
      {
        retries: 1,

        successMessage: "Membership created successfully",
        onSuccess: () => {
          refetch();
          onSuccess?.(customer);
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Create Membership"
      subTitle="Select an existing customer to create membership"
      size="lg"
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
            disabled={!customer || loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            variant="gradient"
          >
            Create Membership
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Customer Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Customer
          </label>

          <SmartSelect
            customRoute="/customers"
            displayField={["phone", "name"]}
            idField="_id"
            placeholder="Search by phone or name"
            minSearchLength={3}
            phoneInstant
            phoneLength={11}
            value={
              customer
                ? {
                    value: customer._id,
                    label: `${customer.phone} — ${customer.name}`,
                    raw: customer,
                  }
                : null
            }
            onChange={(opt) => setValue("customer", opt?.raw || null)}
            error={errors.customer?.message}
          />
        </div>

        {/* Preview */}
        {customer && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <div className="text-sm">
              <div className="font-medium text-blue-800">{customer.name}</div>
              <div className="text-blue-600">{customer.phone}</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

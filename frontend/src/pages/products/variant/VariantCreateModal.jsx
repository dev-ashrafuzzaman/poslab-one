import { useForm, Controller, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import AsyncSelect from "../../../components/ui/AsyncSelect";

export default function VariantCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productId: "",
      size: "",
      color: "",
      confirm: false,
    },
  });

  /* 👀 Watchers */
  const productId = useWatch({ control, name: "productId" });
  const size = useWatch({ control, name: "size" });
  const color = useWatch({ control, name: "color" });
  const confirmed = useWatch({ control, name: "confirm" });

  const loadProducts = async (search) => {
    const res = await request(
      "/products",
      "GET",
      { search, limit: 10 },
      { useToast: false },
    );

    return res?.data?.map((p) => ({
      label: p.name,
      value: p._id,
    }));
  };

  const loadSizes = async (search) => {
    const res = await request(
      "/variants/attributes",
      "GET",
      { type: "size", search },
      { useToast: false },
    );

    return res?.data?.map((s) => ({
      label: s.name,
      value: s.name,
    }));
  };

  const loadColors = async (search) => {
    const res = await request(
      "/variants/attributes",
      "GET",
      { type: "color", search },
      { useToast: false },
    );

    return res?.data?.map((c) => ({
      label: c.name,
      value: c.name,
    }));
  };

  /* 📦 Submit */
  const onSubmit = async (data) => {
    await request(
      "/variants",
      "POST",
      {
        productId: data.productId,
        attributes: {
          size: data.size,
          color: data.color,
        },
      },
      {
        successMessage: "Variant created successfully",
        onSuccess: () => {
          reset();
          setIsOpen(false);
          refetch();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add Product Variant"
      subTitle="Search & select attributes"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!confirmed || loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            variant="gradient">
            Create Variant
          </Button>
        </div>
      }>
      <div className="flex flex-col gap-4">
        <Controller
          name="productId"
          control={control}
          rules={{ required: "Product is required" }}
          render={({ field }) => (
            <AsyncSelect
              label="Product"
              placeholder="Search product..."
              loadOptions={loadProducts}
              value={field.value}
              onChange={field.onChange}
              error={errors.productId?.message}
            />
          )}
        />

        <Controller
          name="size"
          control={control}
          rules={{ required: "Size is required" }}
          render={({ field }) => (
            <AsyncSelect
              label="Size"
              placeholder="Search size..."
              loadOptions={loadSizes}
              disabled={!productId}
              value={field.value}
              onChange={field.onChange}
              error={errors.size?.message}
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          rules={{ required: "Color is required" }}
          render={({ field }) => (
            <AsyncSelect
              label="Color"
              placeholder="Search color..."
              loadOptions={loadColors}
              disabled={!size}
              value={field.value}
              onChange={field.onChange}
              error={errors.color?.message}
            />
          )}
        />

        <Controller
          name="confirm"
          control={control}
          render={({ field }) => (
            <Checkbox
              disabled={!productId || !size || !color}
              checked={field.value}
              onChange={field.onChange}
              label="I confirm variant information is correct"
            />
          )}
        />
      </div>
    </Modal>
  );
}

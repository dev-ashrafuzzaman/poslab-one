// CategoryCreateModal.jsx
import { useForm, Controller, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import useTableManager from "../../../hooks/useTableManager";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

export default function CategoryCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

  const parentTable = useTableManager("/categories?level=1");
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      level: 1,
      parentId: null,
    },
  });

  const level = useWatch({ control, name: "level" });

  const onSubmit = async (data) => {
    if (data.level === 1) {
      data.parentId = null;
    }

    await request("/categories", "POST", data, {
      successMessage: "Category created successfully",
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
      title="Add New Category"
      subTitle="Create category with hierarchy support"
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
            variant="gradient">
            Create Category
          </Button>
        </div>
      }>
      <div className="flex flex-col gap-4">
        <Controller
          name="level"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label="Category Level"
              value={field.value}
              onChange={field.onChange}
              options={[
                { label: "Level 1", value: 1 },
                { label: "Level 2", value: 2 },
                { label: "Level 3", value: 3 },
              ]}
            />
          )}
        />

        {level > 1 && (
          <Controller
            name="parentId"
            control={control}
            rules={{ required: "Parent category is required" }}
            render={({ field }) => (
              <Select
                label="Parent Category"
                value={field.value}
                onChange={field.onChange}
                options={parentTable?.rows?.map((c) => ({
                  label: c.name,
                  value: c._id,
                }))}
              />
            )}
          />
        )}

        <Input
          label="Category Name"
          placeholder="Men's Wear"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
          })}
        />
      </div>
    </Modal>
  );
}

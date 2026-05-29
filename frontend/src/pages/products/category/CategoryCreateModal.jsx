// CategoryCreateModal.jsx

import { useForm, Controller, useWatch } from "react-hook-form";
import { Loader2, FolderTree } from "lucide-react";

import useApi from "../../../hooks/useApi";

import Modal from "../../../components/modals/Modal";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import CategorySelect from "../../../components/select/CategorySelect";

export default function CategoryCreateModal({
  isOpen,
  setIsOpen,
  refetch,
}) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",

      level: 1,

      parentCategory: null,
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                                   WATCHERS                                 */
  /* -------------------------------------------------------------------------- */

  const level = useWatch({
    control,
    name: "level",
  });

  const parentCategory = useWatch({
    control,
    name: "parentCategory",
  });

  /* -------------------------------------------------------------------------- */
  /*                                   SUBMIT                                   */
  /* -------------------------------------------------------------------------- */

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),

      level: Number(data.level),

      parentId:
        Number(data.level) === 1
          ? null
          : data.parentCategory?._id || null,
    };

    await request("/categories", "POST", payload, {
      successMessage: "Category created successfully",

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
      title="Create Category"
      subTitle="Professional hierarchical category management"
      size="lg"
      footer={
        <div className="flex items-center justify-between border-t border-gray-100 pt-5">
          <div className="text-sm text-gray-500">
            ERP category structure
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              variant="gradient"
              prefix={
                loading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )
              }>
              Create Category
            </Button>
          </div>
        </div>
      }>
      <div className="space-y-5">
        {/* ------------------------------------------------------------------ */}
        {/* LEVEL */}
        {/* ------------------------------------------------------------------ */}

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FolderTree className="w-5 h-5 text-blue-600" />

            <h3 className="font-semibold text-gray-800">
              Category Hierarchy
            </h3>
          </div>

          <div className="space-y-4">
            {/* LEVEL */}
            <Controller
              name="level"
              control={control}
              rules={{
                required: "Level required",
              }}
              render={({ field }) => (
                <Select
                  label="Category Level"
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);

                    // reset parent
                    setValue("parentCategory", null);
                  }}
                  options={[
                    {
                      label: "Level 1 (Main Category)",
                      value: 1,
                    },

                    {
                      label: "Level 2 (Sub Category)",
                      value: 2,
                    },
                  ]}
                  error={errors.level?.message}
                />
              )}
            />

            {/* PARENT CATEGORY */}
            {Number(level) > 1 && (
              <CategorySelect
                label="Parent Category"
                level={1}
                value={parentCategory}
                onChange={(val) =>
                  setValue("parentCategory", val)
                }
                error={errors.parentCategory?.message}
              />
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* NAME */}
        {/* ------------------------------------------------------------------ */}

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <Input
            label="Category Name"
            placeholder="e.g. CCTV Camera"
            error={errors.name?.message}
            {...register("name", {
              required: "Category name required",
            })}
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PREVIEW */}
        {/* ------------------------------------------------------------------ */}

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            Structure Preview
          </h4>

          <div className="text-sm text-blue-700">
            {Number(level) === 1 ? (
              <span>
                Main Category →{" "}
                <strong>
                  {parentCategory?.name || "New Category"}
                </strong>
              </span>
            ) : (
              <span>
                {parentCategory?.name || "Parent Category"} →{" "}
                <strong>Sub Category</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
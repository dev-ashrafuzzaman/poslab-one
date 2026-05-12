import { useForm, Controller, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";

import Modal from "../../components/modals/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Checkbox from "../../components/ui/Checkbox";
import MultiSelect from "../../components/ui/MultiSelect";

import useApi from "../../hooks/useApi";
import useTableManager from "../../hooks/useTableManager";
import { COLOR_OPTIONS } from "./variant/variantOptions";

/* -----------------------
   Static Options
------------------------ */
const SIZE_TYPE_OPTIONS = [
  { label: "Text Size (XS, S, M...)", value: "TEXT" },
  { label: "Number Size (40–45)", value: "NUMBER" },
  { label: "No Size (Accessory)", value: "N/A" },
];

/* =========================
   ProductCreateModal
========================= */
export default function ProductCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      level1Id: "",
      categoryId: "",
      productTypeId: "",
      name: "",
      sizeType: "",
      sizeMin: "",
      sizeMax: "",
      sizeStep: 1,
      colors: [],
      confirm: false,
    },
  });

  /* -----------------------
     Watchers
  ------------------------ */
  const level1Id = useWatch({ control, name: "level1Id" });
  const sizeType = useWatch({ control, name: "sizeType" });
  const confirmed = useWatch({ control, name: "confirm" });

  const selectedProductTypeId = useWatch({
    control,
    name: "productTypeId",
  });

  /* -----------------------
     Data Sources
  ------------------------ */
  const level1Table = useTableManager("/categories?level=1");

  const level2Table = useTableManager(
    level1Id ? `/categories?level=2&parentId=${level1Id}` : null,
    {
      enabled: !!level1Id,
      keepPreviousData: false,
    },
  );

  const productTypeTable = useTableManager("/products/types");

  const selectedProductType = productTypeTable.rows.find(
    (p) => p._id === selectedProductTypeId,
  );

  /* -----------------------
     Submit Handler
  ------------------------ */
  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      categoryId: data.categoryId,
      level1Id,
      productTypeId: data.productTypeId,
      sizeType: data.sizeType,
      colors: data.colors.map((c) => c.value),
    };

    // Only NUMBER sends sizeConfig
    if (data.sizeType === "NUMBER") {
      payload.sizeConfig = {
        min: Number(data.sizeMin),
        max: Number(data.sizeMax),
        step: Number(data.sizeStep || 1),
      };
    }

    await request("/products", "POST", payload, {
      successMessage: "Product created successfully",
      onSuccess: () => {
        reset();
        setIsOpen(false);
        refetch?.();
      },
    });
  };

  /* =========================
     Render
  ========================= */
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Create New Product"
      subTitle="Fill in the details to add a new product to your inventory"
      size="6xl"
      footer={
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!confirmed || loading}
            className="px-8 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
          >
            Create Product
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Form Sections */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Category Section */}
            <div className="bg-gray-50/60 rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-linear-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800">
                  CATEGORY
                </h3>
              </div>

              <div className="space-y-4 pl-1">
                <Controller
                  name="level1Id"
                  control={control}
                  rules={{ required: "Main category required" }}
                  render={({ field }) => (
                    <Select
                      label="Main Category"
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue("categoryId", "");
                      }}
                      options={level1Table.rows.map((c) => ({
                        label: c.name,
                        value: c._id,
                      }))}
                      error={errors.level1Id?.message}
                      className="bg-white"
                    />
                  )}
                />

                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: "Sub category required" }}
                  render={({ field }) => (
                    <div className="relative">
                      <Select
                        label="Sub Category"
                        disabled={!level1Id}
                        value={field.value}
                        onChange={field.onChange}
                        options={level2Table?.rows?.map((c) => ({
                          label: c.name,
                          value: c._id,
                        }))}
                        error={errors.categoryId?.message}
                        className="bg-white"
                      />
                      {!level1Id && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
                          <span className="text-sm text-gray-400">
                            Select main category first
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Product Details Section */}
            <div className="bg-gray-50/60 rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-linear-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800">
                  PRODUCT DETAILS
                </h3>
              </div>

              <div className="space-y-4 pl-1">
                <Controller
                  name="productTypeId"
                  control={control}
                  rules={{ required: "Product type required" }}
                  render={({ field }) => (
                    <Select
                      label="Product Type"
                      value={field.value}
                      onChange={field.onChange}
                      options={productTypeTable.rows.map((p) => ({
                        label: p.name,
                        value: p._id,
                      }))}
                      error={errors.productTypeId?.message}
                      className="bg-white"
                    />
                  )}
                />

                <Input
                  label="Product Name"
                  placeholder="e.g., Cotton T-Shirt, Leather Boots"
                  {...register("name", { required: "Product name required" })}
                  error={errors.name?.message}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Size Configuration Section */}
          <div className="bg-gray-50/60 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-5 bg-linear-to-b from-amber-500 to-orange-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800">
                SIZE CONFIGURATION
              </h3>
            </div>

            <div className="space-y-4 pl-1">
              <Controller
                name="sizeType"
                control={control}
                rules={{ required: "Size type required" }}
                render={({ field }) => (
                  <Select
                    label="Size Type"
                    value={field.value}
                    onChange={field.onChange}
                    options={SIZE_TYPE_OPTIONS}
                    error={errors.sizeType?.message}
                    className="bg-white"
                  />
                )}
              />

              {/* NUMBER SIZE CONFIG */}
              {sizeType === "NUMBER" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <h4 className="text-sm font-medium text-gray-700">
                      Numeric Size Range
                    </h4>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Min Size"
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register("sizeMin", { required: true })}
                      className="bg-gray-50"
                    />
                    <Input
                      label="Max Size"
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register("sizeMax", { required: true })}
                      className="bg-gray-50"
                    />
                    <Input
                      label="Step"
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register("sizeStep")}
                      className="bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Size range will be generated automatically based on these
                    values
                  </p>
                </div>
              )}

              {/* Size Type Info */}
              {sizeType && sizeType !== "NUMBER" && (
                <div
                  className={`text-sm px-4 py-3 rounded-lg ${
                    sizeType === "TEXT"
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "bg-gray-50 text-gray-600 border border-gray-100"
                  }`}
                >
                  {sizeType === "TEXT"
                    ? "✓ Product will use standard text sizes (XS, S, M, L, XL, etc.)"
                    : "✓ This product does not require size specifications"}
                </div>
              )}
            </div>
          </div>

          {selectedProductType?.name !== "Accessories" && (
            <div className="bg-gray-50/60 rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800">
                  COLOR OPTIONS
                </h3>
              </div>

              <div className="pl-1">
                <Controller
                  name="colors"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      label="Select Available Colors"
                      value={field.value}
                      onChange={field.onChange}
                      options={COLOR_OPTIONS}
                      placeholder="Choose colors for this product"
                      className="bg-white"
                    />
                  )}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Selected colors will be available for this product variant
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Section */}
          <div className="bg-linear-to-r from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-start gap-3">
              <Controller
                name="confirm"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-0.5"
                  />
                )}
              />
              <div>
                <label className="text-sm font-medium text-gray-700 cursor-pointer">
                  I confirm the information is correct
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  By checking this box, you verify that all product details are
                  accurate and ready for creation.
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className={`mt-4 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                confirmed
                  ? "bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-100"
                  : "bg-linear-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-100"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  confirmed ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              ></div>
              <span>
                {confirmed
                  ? "✓ Ready to create product - All information confirmed"
                  : "⚠ Please review and confirm the information before creating the product"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

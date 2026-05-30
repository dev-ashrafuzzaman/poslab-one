import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Package2,
  Layers3,
  Plus,
  Trash2,
  Boxes,
  ScanLine,
  FileText,
  Sparkles,
} from "lucide-react";

import Modal from "../../components/modals/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Checkbox from "../../components/ui/Checkbox";
import Textarea from "../../components/ui/Textarea";

import useApi from "../../hooks/useApi";
import CategorySelect from "../../components/select/CategorySelect";
import BrandSelect from "../../components/select/BrandSelect";
import UnitSelect from "../../components/select/UnitSelect";
import ProductTypeSelect from "../../components/select/ProductTypeSelect";
import WarrantySelect from "../../components/select/WarrantySelect";

export default function ProductCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues, 
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      productType: null,
      category: null,
      subCategory: null,
      barcode: "",
      rackNo: "",
      model: "",
      brand: null,
      unit: null,
      description: "",
      defaultWarranty: null,
      confirm: false,
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const productName = useWatch({ control, name: "name" });
  const productType = useWatch({ control, name: "productType" });
  const category = useWatch({ control, name: "category" });
  const subCategory = useWatch({ control, name: "subCategory" });
  const brand = useWatch({ control, name: "brand" });
  const unit = useWatch({ control, name: "unit" });
  const confirmed = useWatch({ control, name: "confirm" });
  const defaultWarranty = useWatch({ control, name: "defaultWarranty" });
  const globalModel = useWatch({ control, name: "model" });
  const masterBarcode = useWatch({ control, name: "barcode" });
  const watchedVariants = useWatch({ control, name: "variants" });

  const variantCount = useMemo(() => {
    return watchedVariants?.length || 0;
  }, [watchedVariants]);

  const handleAiNameOptimize = async () => {
    const currentName = getValues("name")?.trim();
    if (!currentName) {
      toast.error("Please type an initial product name first.");
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await request(
        "/products/ai-generate-name",
        "POST",
        { name: currentName },
        { useToast: false }
      );

      const finalName = res?.optimizedName || res?.data?.optimizedName;

      if (finalName) {
        setValue("name", finalName, { 
          shouldValidate: true,
          shouldDirty: true 
        });
        toast.success("Product name optimized via AI Engine!");
      } else {
        toast.error("AI couldn't optimize this string. Format invalid.");
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      toast.error("AI Server error. Please type manually.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!productType?._id || !category?._id || !brand?._id || !unit?._id) {
      toast.error("Please fill up all required master selections.");
      return;
    }

    const processedVariants = data.variants
      .map((v) => ({
        attributeName: v.attributeName?.trim() || "",
        attributeValue: v.attributeValue?.trim() || "",
        model: v.model?.trim() || data.model?.trim() || null,
        barcode: v.barcode?.trim() || data.barcode?.trim() || null,
        warrantyId: v.warranty?._id || data.defaultWarranty?._id || null,
      }))
      .filter((v) => v.attributeName && v.attributeValue);

    const payload = {
      name: data.name.trim(),
      productTypeId: productType._id,
      categoryId: category._id,
      subCategoryId: subCategory?._id || null,
      brandId: brand._id,
      unitId: unit._id,
      barcode: data.barcode?.trim() || null,
      rackNo: data.rackNo?.trim() || null,
      model: data.model?.trim() || null,
      description: data.description?.trim() || null,
      warrantyId: defaultWarranty?._id || null,
      variants: processedVariants.length > 0 ? processedVariants : [],
    };
console.log(payload)
    await request("/products", "POST", payload, {
      successMessage: "Product Created successfully!",
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
      title="Create ERP Product Matrix"
      subTitle="Multi-Axis Attribute Management For CCTV & IT Hardware Assets"
      size="7xl"
      footer={
        <div className="flex items-center justify-between border-t border-gray-100 pt-5 w-full">
          <div className="text-sm font-semibold text-gray-600">
            Total Variants Matrix:{" "}
            <span className="text-blue-600">{variantCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!confirmed}
              onClick={handleSubmit(onSubmit)}
            >
              Generate Product Engine
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-2">
        {/* SECTION 1: IDENTITY */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Package2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-md font-bold text-gray-800">Product Identity</h2>
          </div>
          
          <div className="relative w-full">
            <Input
              label="Product Global Display Name"
              placeholder="e.g. seagate surveillance internal hard disk 2tb"
              value={productName || ""} 
              {...register("name", {
                required: "Product identity name is required",
              })}
              error={errors.name?.message}
            />

            <button
              type="button"
              disabled={isAiLoading}
              onClick={handleAiNameOptimize}
              className="absolute right-0 top-0 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all"
              title="Click to polish and optimize via ERP AI Engine"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-400" />
                  <span>AI Optimize</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ProductTypeSelect
              value={productType}
              onChange={(val) => setValue("productType", val)}
            />
            <CategorySelect
              label="Parent Category"
              level={1}
              value={category}
              onChange={(val) => {
                setValue("category", val);
                setValue("subCategory", null);
              }}
            />
            <CategorySelect
              label="Sub Category"
              level={2}
              parentId={category?._id}
              value={subCategory}
              onChange={(val) => setValue("subCategory", val)}
            />
          </div>
        </div>

        {/* SECTION 2: MASTER DEFAULTS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Layers3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-md font-bold text-gray-800">
              Master Defaults / Fallbacks
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label="Master Box Barcode (Optional)"
              placeholder="Scan hardware barcode"
              suffix={<ScanLine className="w-4 h-4 text-gray-400" />}
              {...register("barcode")}
            />
            <Input
              label="Warehouse Rack Location"
              placeholder="e.g. A-01-R2"
              {...register("rackNo")}
            />
            <Input
              label="Default / Base Model Name"
              placeholder="e.g. SkyHawk Series"
              {...register("model")}
            />
            <BrandSelect
              value={brand}
              onChange={(val) => setValue("brand", val)}
            />
            <UnitSelect
              value={unit}
              onChange={(val) => setValue("unit", val)}
            />
            <WarrantySelect
              value={defaultWarranty}
              onChange={(val) => setValue("defaultWarranty", val)}
            />
          </div>
        </div>

        {/* SECTION 3: DYNAMIC DUAL-AXIS VARIANT MATRIX */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-md font-bold text-gray-800">
                  Dynamic Product Variants
                </h2>
                <p className="text-xs text-gray-400">
                  Leave empty if product has no attributes/variants
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                appendVariant({
                  attributeName: "",
                  attributeValue: "",
                  model: "",
                  barcode: "", 
                  warranty: null,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Attribute Specification
            </button>
          </div>

          {variantFields.length > 0 && (
            <div className="border border-gray-100 rounded-xl bg-white p-1" style={{ overflow: "visible" }}>
              <table className="w-full table-fixed text-left border-collapse" style={{ overflow: "visible" }}>
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-600">
                    <th className="p-3 w-[16%]">Attribute Axis</th>
                    <th className="p-3 w-[14%]">Value</th>
                    <th className="p-3 w-[20%]">Specific Model</th>
                    <th className="p-3 w-[22%]">Box Barcode No</th> 
                    <th className="p-3 w-[22%]">Specific Warranty</th>
                    <th className="p-3 w-[6%] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm" style={{ overflow: "visible" }}>
                  {variantFields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-gray-50/30 transition-colors" style={{ overflow: "visible" }}>
                      <td className="p-2 align-middle">
                        <Input
                          showLabel={false}
                          title="Enter Attribute Name (e.g. Capacity)"
                          placeholder="e.g. Capacity"
                          className="w-full"
                          inputClassName="h-5 text-xs"
                          {...register(`variants.${index}.attributeName`, { required: true })}
                        />
                      </td>
                      <td className="p-2 align-middle">
                        <Input
                          showLabel={false}
                          title="Enter Value (e.g. 2TB)"
                          placeholder="e.g. 2TB"
                          className="w-full"
                          inputClassName="h-5 text-xs"
                          {...register(`variants.${index}.attributeValue`, { required: true })}
                        />
                      </td>
                      <td className="p-2 align-middle">
                        <Input
                          showLabel={false}
                          title="Enter Specific Model Name"
                          placeholder={globalModel || "e.g. ST2000VX008"}
                          className="w-full"
                          inputClassName="h-5 text-xs"
                          {...register(`variants.${index}.model`)}
                        />
                      </td>
                      <td className="p-2 align-middle">
                        <Input
                          showLabel={false}
                          title="Scan specific variation Box Barcode"
                          placeholder={masterBarcode || "Scan item barcode"}
                          suffix={<ScanLine className="w-3.5 h-3.5 text-gray-400" />}
                          className="w-full"
                          inputClassName="h-5 text-xs"
                          {...register(`variants.${index}.barcode`)}
                        />
                      </td>
                      <td className="p-2 align-middle relative" style={{ zIndex: variantFields.length + 10 - index, overflow: "visible" }}>
                        <div className="w-full relative">
                          <Controller
                            name={`variants.${index}.warranty`}
                            control={control}
                            render={({ field: controllerField }) => (
                              <WarrantySelect
                                value={controllerField.value}
                                onChange={controllerField.onChange}
                                showLabel={false}
                                placeholder={defaultWarranty ? `${defaultWarranty.name} (Inherited)` : "Select Warranty"}
                              />
                            )}
                          />
                        </div>
                      </td>
                      <td className="p-2 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 4: PRODUCT SPECIFICATION DESCRIPTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="text-md font-bold text-gray-800">
              Technical Specifications / Description (Optional)
            </h2>
          </div>
          <Textarea
            label="Product Description"
            placeholder="Enter full device specifications, pinouts, IC details or sales notes..."
            rows={3}
            {...register("description")}
          />
        </div>

        {/* DOUBLE CHECK & CONFIRMATION BLOCK */}
        <div className="rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50/40 to-indigo-50/40 p-6 flex items-center gap-4">
          <div className="flex items-center justify-center shrink-0">
            <Controller
              name="confirm"
              control={control}
              render={({ field }) => (
                <Checkbox checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight select-none">
              Are you sure all informations is correct double check and confirm
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-normal select-none">
              Financial moving average valuation framework and unique barcode
              structures will map onto the database engine instantly.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
import { useFieldArray, useForm, Controller, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Package2,
  Layers3,
  Plus,
  Trash2,
  ShieldCheck,
  Boxes,
  ScanLine
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

export default function ProductCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

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
      confirm: false,
      variantSchema: [
        { name: "Capacity", values: ["500GB", "1TB"] }, // ডিফল্ট এক্সাম্পল ইউজারকে গাইড করার জন্য
        { name: "Warranty", values: ["No Warranty", "1 Year"] } // ওয়ারেন্টি এখন নিজেই অ্যাক্সিস!
      ],       
      variants: [],            
    },
  });

  // Watchers
  const watchedSchema = useWatch({ control, name: "variantSchema" }) || [];
  const productType = useWatch({ control, name: "productType" });
  const category = useWatch({ control, name: "category" });
  const subCategory = useWatch({ control, name: "subCategory" });
  const brand = useWatch({ control, name: "brand" });
  const masterModel = useWatch({ control, name: "model" });
  const unit = useWatch({ control, name: "unit" });
  const confirmed = useWatch({ control, name: "confirm" });

  // Axis Array (Capacity, Warranty, etc.)
  const { fields: schemaFields, append: appendSchema, remove: removeSchema } = useFieldArray({
    control,
    name: "variantSchema",
  });

  // SKU Matrix Array
  const { fields: variantFields, replace: replaceVariants, remove: removeVariantRow } = useFieldArray({
    control,
    name: "variants",
  });

  // Cartesian Product Engine
  const generateVariantCombinations = (schemas) => {
    if (!schemas || schemas.length === 0) return [];
    const filtered = schemas.filter(s => s.name?.trim() && s.values?.filter(v => v.trim()).length > 0);
    if (filtered.length === 0) return [];

    const result = [];
    const recurse = (index, currentAttr) => {
      if (index === filtered.length) {
        result.push({
          attributes: currentAttr,
          model: masterModel || "",      
          barcode: "",
          salePrice: 0,
        });
        return;
      }
      const currentSchema = filtered[index];
      const validValues = currentSchema.values.filter(v => v.trim());
      for (const val of validValues) {
        recurse(index + 1, { ...currentAttr, [currentSchema.name.trim()]: val.trim() });
      }
    };
    recurse(0, {});
    return result;
  };

  // Re-calculate Matrix when Schema Changes
  useEffect(() => {
    const combinations = generateVariantCombinations(watchedSchema);
    replaceVariants(combinations);
  }, [JSON.stringify(watchedSchema)]);

  // Master Model Live Sync
  useEffect(() => {
    const currentVariants = getValues("variants") || [];
    if (currentVariants.length > 0) {
      const updated = currentVariants.map(v => ({ ...v, model: v.model || masterModel }));
      replaceVariants(updated);
    }
  }, [masterModel]);

const onSubmit = async (data) => {
    if (!productType?._id || !category?._id || !brand?._id || !unit?._id) {
      toast.error("Please fill up all required master selections.");
      return;
    }

    const payload = {
      name: data.name.trim(),
      productTypeId: productType._id,
      categoryId: category._id,
      subCategoryId: subCategory?._id || null, //  এখানে টাইপো ফিক্স করা হয়েছে
      brandId: brand._id,
      unitId: unit._id,
      barcode: data.barcode?.trim() || null,
      rackNo: data.rackNo?.trim() || null,
      model: data.model?.trim() || null,
      description: data.description?.trim() || null,
      variantSchema: (data.variantSchema || [])
        .filter((s) => s.name?.trim())
        .map((s) => ({
          name: s.name.trim(),
          values: s.values.filter((v) => v?.trim()).map((v) => v.trim()),
        })),
      variants: data.variants.map((v) => ({
        attributes: v.attributes, 
        model: v.model?.trim() || data.model?.trim() || null,             
        barcode: v.barcode?.trim() || null,
        salePrice: Number(v.salePrice) || 0          
      })),
    };

    await request("/products", "POST", payload, {
      successMessage: "Product Matrix built successfully!",
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
          <div className="text-sm text-gray-500 font-medium">
            Active Generated SKUs: <strong className="text-gray-800">{variantFields.length || 1} SKUs</strong>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button
              disabled={!confirmed || loading}
              onClick={handleSubmit(onSubmit)}
              prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            >
              Generate Product Engine
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-2">
        
        {/* PROFILE */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Package2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-md font-bold text-gray-800">Product Identity</h2>
          </div>
          <Input
            label="Product Global Display Name"
            placeholder="e.g. Seagate Surveillance Internal Hard Disk"
            {...register("name", { required: "Product identity name is required" })}
            error={errors.name?.message}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ProductTypeSelect value={productType} onChange={(val) => setValue("productType", val)} />
            <CategorySelect label="Parent Category" level={1} value={category} onChange={(val) => { setValue("category", val); setValue("subCategory", null); }} />
            <CategorySelect label="Sub Category" level={2} parentId={category?._id} value={subCategory} onChange={(val) => setValue("subCategory", val)} />
          </div>
        </div>

        {/* LOGISTICS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Layers3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-md font-bold text-gray-800">Master Defaults</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="relative">
              <Input label="Master Box Barcode" placeholder="Scan hardware barcode" {...register("barcode")} />
              <ScanLine className="absolute right-3 top-10 w-4 h-4 text-gray-400" />
            </div>
            <Input label="Warehouse Rack Location" placeholder="e.g. A-01-R2" {...register("rackNo")} />
            <Input label="Default / Base Model Name" placeholder="e.g. SkyHawk Series" {...register("model")} />
            <BrandSelect value={brand} onChange={(val) => setValue("brand", val)} />
            <UnitSelect value={unit} onChange={(val) => setValue("unit", val)} />
          </div>
        </div>

        {/* DYNAMIC VARIATION GENERATOR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-orange-600" />
              <div>
                <h2 className="text-md font-bold text-gray-800">Multi-Axis Variations Matrix Configuration</h2>
                <p className="text-xs text-gray-400">Add Capacity, Warranty, Channels etc. as distinct axes</p>
              </div>
            </div>
            <Button type="button" variant="outlined" size="sm" prefix={<Plus className="w-4 h-4" />} onClick={() => appendSchema({ name: "", values: [""] })}>
              Add Matrix Axis
            </Button>
          </div>

          <div className="space-y-4">
            {schemaFields.map((schema, sIdx) => (
              <div key={schema.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-200 flex gap-4 items-start">
                <div className="w-1/4">
                  <Input placeholder="Axis Name (e.g. Warranty)" {...register(`variantSchema.${sIdx}.name`)} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {watchedSchema[sIdx]?.values?.map((_, vIdx) => (
                      <div key={vIdx} className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-3xs">
                        <input className="text-xs px-2 py-1 focus:outline-none w-24" placeholder="Value" {...register(`variantSchema.${sIdx}.values.${vIdx}`)} />
                        <button type="button" className="text-red-500 font-bold px-1 hover:bg-red-50 rounded" onClick={() => { const current = getValues(`variantSchema.${sIdx}.values`); if (current.length > 1) setValue(`variantSchema.${sIdx}.values`, current.filter((_, i) => i !== vIdx)); }}>×</button>
                      </div>
                    ))}
                    <button type="button" className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100" onClick={() => { const current = getValues(`variantSchema.${sIdx}.values`) || []; setValue(`variantSchema.${sIdx}.values`, [...current, ""]); }}>+ Option</button>
                  </div>
                </div>
                <button type="button" className="text-red-500 p-2 hover:bg-red-50 rounded-xl" onClick={() => removeSchema(sIdx)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SKU GENERATION MATRIX GRID */}
        {variantFields.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4 overflow-x-auto">
            <div>
              <h3 className="text-sm font-bold text-gray-700">Calculated Dynamic SKU Manifest</h3>
              <p className="text-xs text-gray-400">Review generated variants. You can remove combinations that do not exist in real stock.</p>
            </div>
            <table className="w-full text-left text-sm table-fixed min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                  <th className="p-3 w-1/3">Combinations Path</th>
                  <th className="p-3 w-1/4">Specific Factory Model No</th>
                  <th className="p-3 w-32">Retail Price</th>
                  <th className="p-3 w-40">Item Barcode</th>
                  <th className="p-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {variantFields.map((field, index) => {
                  const specLabel = Object.entries(field.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(" / ");
                  return (
                    <tr key={field.id} className="border-b border-gray-100 hover:bg-gray-50/30">
                      <td className="p-3 font-semibold text-gray-700 truncate">{specLabel}</td>
                      <td className="p-2">
                        <Input placeholder={`Fallback: ${masterModel || "None"}`} {...register(`variants.${index}.model`)} />
                      </td>
                      <td className="p-2">
                        <Input type="number" placeholder="0.00" {...register(`variants.${index}.salePrice`)} />
                      </td>
                      <td className="p-2">
                        <Input placeholder="Custom Barcode Scan" {...register(`variants.${index}.barcode`)} />
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeVariantRow(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGISTICS BLOCK CONFIRMATION */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/40 to-indigo-50/40 p-6 flex items-start gap-4">
          <Controller name="confirm" control={control} render={({ field }) => <Checkbox checked={field.value} onChange={field.onChange} />} />
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">Lock Structural Data Mapping</h3>
            <p className="text-xs text-gray-500 mt-0.5">Financial accounting valuation initialized via moving averages seamlessly based on these combinations.</p>
          </div>
        </div>

      </div>
    </Modal>
  );
}
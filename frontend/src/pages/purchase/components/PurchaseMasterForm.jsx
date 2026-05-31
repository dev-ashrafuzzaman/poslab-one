import { Controller } from "react-hook-form";
import { FileText, Calendar } from "lucide-react";
import Input from "../../../components/ui/Input";
import SupplierSelect from "../../../components/select/SupplierSelect";

export default function PurchaseMasterForm({ register, errors, control }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <Input
        label="Invoice / Voucher No *"
        placeholder="e.g. PUR-2026-0045"
        prefix={<FileText className="size-4 text-gray-400" />}
        error={errors.invoiceNo?.message}
        inputClassName="font-semibold"
        {...register("invoiceNo", {
          required: "Master tracker key designation index is required.",
        })}
      />

      <Input
        label="Subject / Reference"
        placeholder="e.g. Bulk Import Warehouse Component Batches"
        {...register("subject")}
      />

      <Input
        label="Purchase Date *"
        type="date"
        prefix={<Calendar className="size-4 text-gray-400" />}
        error={errors.purchaseDate?.message}
        {...register("purchaseDate", {
          required: "Voucher logging general timeline target is required.",
        })}
      />

      <div className="w-full flex flex-col">
        <Controller
          control={control}
          name="supplier"
          rules={{ required: "Supplier verification anchor linkage required." }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <SupplierSelect
              value={value}
              onChange={onChange}
              error={error?.message}
              allowCreate={false}
            />
          )}
        />
      </div>
    </div>
  );
}

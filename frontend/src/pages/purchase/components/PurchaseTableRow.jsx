import { Fragment } from "react";
import { Trash2 } from "lucide-react";
import Input from "../../../components/ui/Input";
import PurchaseSerialEntry from "./PurchaseSerialEntry";

export default function PurchaseTableRow({
  field,
  index,
  watchedItem,
  register,
  errors,
  remove,
  getValues,
  setValue,
  handleQtyChange,
}) {
  const isSerialProduct = watchedItem?.productTypeName === "serial-product";
  const rowQty = watchedItem?.qty || 0;
  const rowPrice = watchedItem?.purchasePrice || 0;
  const lineTotal = Math.max(0, parseInt(rowQty) * parseFloat(rowPrice));

  return (
    <Fragment>
      <tr className="align-top hover:bg-gray-50/40 transition-all duration-100">
        <td className="p-3">
          <div className="font-semibold text-gray-900">{field.title}</div>
          <div className="text-xs text-gray-400 font-mono mt-0.5 select-none">
            SKU: {field.sku} | Model: {field.model} | Warranty:{" "}
            {field.warrantyName}
          </div>
        </td>

        <td className="p-3 text-center">
          <input
            type="number"
            min="1"
            className={`w-full h-10 px-2 text-sm font-bold border rounded-lg text-center bg-white text-gray-800 outline-none focus:border-blue-500 transition-all ${
              errors?.items?.[index]?.qty
                ? "border-red-500 focus:ring-1 focus:ring-red-100 bg-red-50/20"
                : "border-gray-300"
            }`}
            value={watchedItem?.qty || 0}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => handleQtyChange(index, e.target.value)}
          />
        </td>

        <td className="p-3">
          <Input
            type="number"
            step="0.01"
            prefix={
              <span className="text-xs text-emerald-600 font-bold select-none">
                ৳
              </span>
            }
            inputClassName="font-bold text-emerald-600 focus:ring-emerald-50"
            showLabel={false}
            onWheel={(e) => e.target.blur()}
            error={errors?.items?.[index]?.purchasePrice ? "Required" : null}
            {...register(`items.${index}.purchasePrice`, {
              required: true,
              valueAsNumber: true,
              validate: (v) => parseFloat(v) >= 0 || "Negative bounds rejected",
            })}
          />
        </td>

        <td className="p-3">
          <Input
            type="number"
            step="0.01"
            prefix={
              <span className="text-xs text-blue-600 font-bold select-none">
                ৳
              </span>
            }
            inputClassName="text-blue-600 font-semibold focus:ring-blue-50"
            placeholder="Retail"
            showLabel={false}
            onWheel={(e) => e.target.blur()}
            {...register(`items.${index}.salePrice`, { valueAsNumber: true })}
          />
        </td>

        <td className="p-3">
          <Input
            type="text"
            value={
              lineTotal
                ? Number(lineTotal.toFixed(2)).toLocaleString("en-IN")
                : "0"
            }
            suffix={
              <span className="text-xs font-bold text-gray-400 select-none">
                BDT
              </span>
            }
            inputClassName="font-bold text-gray-900 text-right pr-1 border-gray-200"
            showLabel={false}
            disabled={true}
            className="bg-gray-50 select-none cursor-not-allowed opacity-90"
          />
        </td>

        <td className="p-3 text-center">
          <button
            type="button"
            onClick={() => remove(index)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5 active:scale-95"
            title="Purge row blueprint entry matrix out of current stack memory"
          >
            <Trash2 className="size-4" />
          </button>
        </td>
      </tr>

      {isSerialProduct && (
        <PurchaseSerialEntry
          itemIndex={index}
          field={field}
          watchedItem={watchedItem}
          register={register}
          setValue={setValue}
          getValues={getValues}
          handleQtyChange={handleQtyChange}
        />
      )}
    </Fragment>
  );
}

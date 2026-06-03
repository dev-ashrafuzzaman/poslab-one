import { Truck } from "lucide-react";
import Input from "../../../components/ui/Input";
import ProductSelect from "../../../components/select/ProductSelect";
import PurchaseTableRow from "./PurchaseTableRow";

export default function PurchaseTableGrid({
  itemFields,
  watchedItems,
  register,
  errors,
  remove,
  getValues,
  setValue,
  handleQtyChange,
  handleProductSelect,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100 items-end">
        <div className="md:col-span-4">
          <ProductSelect
            value={null}
            onChange={handleProductSelect}
            label="Search Master Catalog Stock Matrix Variant to Append Dynamic Row"
            placeholder="Type Brand Code, Category Specification, Model Target Name or Private SKU Key..."
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-layout-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200 select-none">
                <th className="p-3 text-left">
                  Product Matrix Identification Specifications
                </th>
                <th className="p-3 w-28 text-center">Quantity</th>
                <th className="p-3 w-44">Buying Cost (BDT)</th>
                <th className="p-3 w-44">Expected Base Retail</th>
                <th className="p-3 w-48 text-right">Account Row Total</th>
                <th className="p-3 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {itemFields.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-gray-400 font-medium select-none"
                  >
                    No active product matrix rows appended inside spreadsheet
                    view template layout.
                    <br /> Start scanning hardware barcodes or querying system
                    item variants to create entries.
                  </td>
                </tr>
              ) : (
                itemFields.map((field, index) => (
                  <PurchaseTableRow
                    key={field.id}
                    field={field}
                    index={index}
                    watchedItem={watchedItems[index]}
                    register={register}
                    errors={errors}
                    remove={remove}
                    getValues={getValues}
                    setValue={setValue}
                    handleQtyChange={handleQtyChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

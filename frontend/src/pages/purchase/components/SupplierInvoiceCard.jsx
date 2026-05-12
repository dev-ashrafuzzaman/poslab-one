// purchase/components/SupplierInvoiceCard.jsx
import SupplierSelect from "./SupplierSelect";
import { FileText, Calendar, CreditCard } from "lucide-react";

export default function SupplierInvoiceCard({
  register,
  supplier,
  setSupplier,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Supplier & Invoice Details
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Supplier
          </label>
          <SupplierSelect value={supplier} onChange={setSupplier} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileText size={16} />
            Invoice Number
          </label>
          <input
            {...register("invoiceNumber", { required: true })}
            placeholder="INV-2024-001"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar size={16} />
            Invoice Date
          </label>
          <input
            type="date"
            {...register("invoiceDate", { required: true })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CreditCard size={16} />
            Paid Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              TK
            </span>
            <input
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              {...register("paidAmount")}
              placeholder="0.00"
              className="pl-8 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
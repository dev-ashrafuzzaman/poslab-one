// purchase/components/PurchaseSummaryBar.jsx
import { CheckCircle } from "lucide-react";

export default function PurchaseSummaryBar({ totalAmount, dueAmount }) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                TK{totalAmount}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Due Amount</div>
              <div className={`text-2xl font-bold ${
                dueAmount > 0 ? 'text-amber-600' : 'text-green-600'
              }`}>
                TK{dueAmount}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="group flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <CheckCircle size={20} />
            <span>Complete Purchase</span>
          </button>
        </div>
      </div>
    </div>
  );
}

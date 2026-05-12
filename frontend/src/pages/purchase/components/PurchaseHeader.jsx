// purchase/components/PurchaseHeader.jsx
import { ShoppingBag } from "lucide-react";

export default function PurchaseHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ShoppingBag className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Purchase Order
          </h1>
          <p className="text-gray-600">
            Add products, enter quantities, and complete purchase
          </p>
        </div>
      </div>
    </div>
  );
}
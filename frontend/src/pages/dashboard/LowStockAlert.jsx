import { AlertCircle, Package } from "lucide-react";

export const LowStockAlert = ({ products }) => {
  // Empty State Fallback (When all items are well-stocked)
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-50">
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h3>
            <p className="text-sm text-gray-500">
              All products are well stocked
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      {/* Card Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Products needing restock
            </p>
          </div>
        </div>
      </div>

      {/* Alert List Container */}
      <div className="space-y-3">
        {products?.map((product, index) => (
          <div
            key={product.id || index}
            className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50"
          >
            {/* Left Content Column: Icon & Metadata */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-red-100 to-red-50 flex items-center justify-center">
                <Package className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {product.name || "Unknown Product"}
                </p>
                <p className="text-sm text-gray-500">
                  SKU: {product.sku || "N/A"}
                </p>
              </div>
            </div>

            {/* Right Content Column: Live Stock Matrix */}
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-red-600">
                  {product.stock || 0}
                </div>
                <div className="text-sm text-gray-500">
                  / {product.threshold || 10} min
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
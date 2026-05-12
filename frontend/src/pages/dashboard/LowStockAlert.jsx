import { AlertCircle, Package } from "lucide-react";

export const LowStockAlert = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Low Stock Alert
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All products are well stocked
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Low Stock Alert
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Products needing restock
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {products?.map((product, index) => (
          <div
            key={product.id || index}
            className="flex items-center justify-between p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.name || "Unknown Product"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  SKU: {product.sku || "N/A"} •{" "}
                  {/* {product.category || "Uncategorized"} */}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {product.stock || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
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

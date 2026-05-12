import { Input } from "@headlessui/react";

export default function PosCart({
  cart,
  updateQty,
  updateDiscount,
  removeItem,
  isLowStock,
}) {

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Cart Header */}
      <div className="px-6 py-2 border-b border-gray-100 bg-linear-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cart Items</h2>
            <p className="text-sm text-gray-600 mt-1">
              {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>

      {/* Cart Items - Desktop View */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-700">
          <div className="col-span-4">Product</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-center">Discount</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-gray-100">
          {cart.map((item) => {
            const unitPrice = item.finalPrice ?? item.salePrice;
            const lineTotal = Math.max(item.qty * unitPrice, 0);

            return (
              <div
                key={item.variantId}
                className="px-6 py-4 hover:bg-blue-50/50 transition-all duration-200 group"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Product Info */}
                  <div className="col-span-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {(item.productName || "").charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {item.productName}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          SKU: {item.sku}
                        </p>
                        {isLowStock(item) && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 mt-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Low Stock ({item.stockQty} left)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <div className="flex justify-center">
                      <div className="relative">
                        <Input
                          type="number"
                          onWheel={(e) => e.currentTarget.blur()}
                          min={1}
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(item.variantId, Number(e.target.value))
                          }
                          className="w-20 text-center bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 rounded-lg py-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-gray-900 font-semibold">
                        {item.salePrice}
                      </span>
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="col-span-2">
                    {item.discountValue > 0 && (
                      <div className="flex items-center justify-center text-yellow-600 font-semibold">
                        <p>{item.discountValue}</p>
                        <p>{item.discountType === "PERCENT" ? "%" : "FLT"}</p>
                      </div>
                    )}
                  </div>

                  {/* Line Total */}
                  <div className="col-span-1 text-right">
                    <div className="font-bold text-blue-700 text-lg">
                      {lineTotal}
                    </div>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg  text-red-600 bg-red-50 border-2 border-transparent hover:border-red-200 transition-all duration-200 group/remove"
                      title="Remove item"
                    >
                      <span className="group-hover/remove:scale-110 transition-transform">
                        ✕
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Items - Mobile View */}
      <div className="lg:hidden divide-y divide-gray-100">
        {cart.map((item) => {
          const unitPrice = item.finalPrice ?? item.salePrice;
          const lineTotal = Math.max(item.qty * unitPrice, 0);

          return (
            <div
              key={item.variantId}
              className="p-4 hover:bg-blue-50/50 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold">
                      {(item.productName || "").charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      SKU: {item.sku}
                    </p>
                    {isLowStock(item) && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 mt-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        Low Stock
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    min={1}
                    value={item.qty}
                    onChange={(e) =>
                      updateQty(item.variantId, Number(e.target.value))
                    }
                    className="w-full text-center bg-white border-2 border-gray-200 rounded-lg py-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Price
                  </label>
                  <div className="text-gray-900 font-semibold text-center py-2 border-2 border-gray-200 rounded-lg bg-gray-50">
                    {item.salePrice}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Discount
                  </label>
                  <select
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
                    value={item.discountType || ""}
                    onChange={(e) =>
                      updateDiscount(
                        item.variantId,
                        "discountType",
                        e.target.value || null,
                      )
                    }
                  >
                    <option value="">No Discount</option>
                    <option value="FIXED">Fixed</option>
                    <option value="PERCENT">%</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Discount Value
                  </label>
                  <Input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    min={0}
                    placeholder="0"
                    disabled={!item.discountType}
                    value={item.discountValue || ""}
                    onChange={(e) =>
                      updateDiscount(
                        item.variantId,
                        "discountValue",
                        Number(e.target.value),
                      )
                    }
                    className="w-full text-center border-2 border-gray-200 rounded-lg py-2"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Line Total:</span>
                  <span className="font-bold text-blue-700 text-lg">
                    {lineTotal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {cart.length === 0 && (
        <div className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Start adding items to process a sale. Scan barcodes or search for
              products.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Ready to scan items</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

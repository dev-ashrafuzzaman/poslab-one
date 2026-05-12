import { Trash2, AlertCircle, Package, Hash, Palette, Ruler, X } from "lucide-react";

const TransferItemsTable = ({ items, setItems }) => {
  const updateQty = (variantId, value, max) => {
    const qty = Number(value);

    if (Number.isNaN(qty)) return;
    if (qty < 1) return;

    setItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId
          ? {
              ...i,
              qty: Math.min(qty, max), // 🔒 HARD GUARD
            }
          : i
      )
    );
  };

  const removeItem = (variantId) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No items added yet</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Start scanning or searching to add items for transfer
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transfer Items</h3>
              <p className="text-sm text-gray-500">Review and adjust quantities</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
            <Hash className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Product Details
              </th>
              <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Ruler className="h-3.5 w-3.5" />
                  Size
                </div>
              </th>
              <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Palette className="h-3.5 w-3.5" />
                  Color
                </div>
              </th>
              <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Available Stock
              </th>
              <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Transfer Qty
              </th>
              <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {items.map((i, index) => {
              const isMax = i.qty === i.availableQty;
              const availablePercentage = (i.qty / i.availableQty) * 100;

              return (
                <tr
                  key={i.variantId}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  {/* Product Details */}
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{i.productName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            SKU: {i.sku}
                          </span>
                          {i.unit && (
                            <span className="text-xs text-gray-500">{i.unit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-4 px-6 text-center">
                    {i.attributes?.size ? (
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                        {i.attributes.size}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Color */}
                  <td className="py-4 px-6 text-center">
                    {i.attributes?.color ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: i.attributes.color.toLowerCase() }} />
                        <span className="text-xs text-gray-600">{i.attributes.color}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Available Qty */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-gray-900">{i.availableQty}</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            availablePercentage >= 90 ? 'bg-red-500' :
                            availablePercentage >= 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(availablePercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">in stock</span>
                    </div>
                  </td>

                  {/* Transfer Qty Input */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          onWheel={(e) => e.currentTarget.blur()}
                          min={1}
                          max={i.availableQty}
                          value={i.qty}
                          onChange={(e) => updateQty(i.variantId, e.target.value, i.availableQty)}
                          className={`
                            w-24 px-4 py-2 rounded-lg border text-center font-medium text-gray-900
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                            transition-all duration-200
                            ${
                              isMax
                                ? 'border-amber-300 bg-amber-50 text-amber-900'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }
                          `}
                        />
                        {isMax && (
                          <div className="absolute -top-2 right-0">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          </div>
                        )}
                      </div>
                      
                      {isMax && (
                        <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                          <AlertCircle className="h-3 w-3" />
                          Maximum available
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Remove Action */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => removeItem(i.variantId)}
                      className="group p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 
                        transition-all duration-200"
                      title="Remove item"
                    >
                      <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden divide-y divide-gray-100">
        {items.map((i) => {
          const isMax = i.qty === i.availableQty;
          const availablePercentage = (i.qty / i.availableQty) * 100;

          return (
            <div
              key={i.variantId}
              className="p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="shrink-0 w-12 h-12 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{i.productName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {i.sku}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {i.attributes?.size && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {i.attributes.size}
                        </span>
                      )}
                      {i.attributes?.color && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Palette className="h-3 w-3" />
                          {i.attributes.color}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(i.variantId)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"
                  title="Remove item"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Available</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{i.availableQty}</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          availablePercentage >= 90 ? 'bg-red-500' :
                          availablePercentage >= 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(availablePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Transfer Qty</p>
                  <div className="relative">
                    <input
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      min={1}
                      max={i.availableQty}
                      value={i.qty}
                      onChange={(e) => updateQty(i.variantId, e.target.value, i.availableQty)}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-center font-medium
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                        ${
                          isMax
                            ? 'border-amber-300 bg-amber-50 text-amber-900'
                            : 'border-gray-300 bg-white'
                        }
                      `}
                    />
                    {isMax && (
                      <div className="absolute -top-1 right-0">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                      </div>
                    )}
                  </div>
                  {isMax && (
                    <p className="text-xs text-amber-600 mt-1">
                      Maximum available
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{items.length}</span> items selected
          </div>
          <div className="text-sm font-medium text-gray-900">
            Total Quantity: <span className="text-primary font-bold">
              {items.reduce((sum, i) => sum + i.qty, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferItemsTable;
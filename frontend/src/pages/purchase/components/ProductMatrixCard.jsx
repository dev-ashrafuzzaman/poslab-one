import { Trash2, DollarSign, Package, Tag } from "lucide-react";

export default function ProductMatrixCard({ item, index, setItems }) {
  const product = item.product;

  /* ======================
     SIZE & COLOR
  ====================== */
  const sizes = product.sizeConfig
    ? product.sizeConfig.values ??
      Array.from(
        {
          length:
            (product.sizeConfig.max - product.sizeConfig.min) /
              product.sizeConfig.step +
            1,
        },
        (_, i) =>
          String(product.sizeConfig.min + i * product.sizeConfig.step)
      )
    : ["NA"];

  const colors =
    product.hasVariant && product.colors?.length
      ? product.colors
      : ["NA"];

  /* ======================
     HELPERS
  ====================== */
  const updateItem = (patch) =>
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );

  const findVariant = (size, color) =>
    item.variants.find((v) => v.size === size && v.color === color);

  /* ======================
     VARIANT UPDATE
  ====================== */
  const updateVariant = (size, color, patch) => {
    const next = [...item.variants];
    const idx = next.findIndex(
      (v) => v.size === size && v.color === color
    );

    const base =
      idx !== -1
        ? next[idx]
        : { size, color, qty: 0, costPrice: 0, salePrice: 0 };

    const updated = { ...base, ...patch };

    if (idx === -1) next.push(updated);
    else next[idx] = updated;

    updateItem({ variants: next });
  };

  /* ======================
     PRICING MODE SWITCH
  ====================== */
  const togglePricingMode = (checked) => {
if (checked) {
  const base =
    item.variants.find(v => v.costPrice || v.salePrice) ||
    { costPrice: 0, salePrice: 0 };

  updateItem({
    pricingMode: "GLOBAL",
    globalPrice: {
      costPrice: base.costPrice,
      salePrice: base.salePrice,
    },

    // 🔑 keep qty matrix alive
    variants: sizes.flatMap(size =>
      colors.map(color => {
        const prev = item.variants.find(
          v => v.size === size && v.color === color
        );
        return {
          size,
          color,
          qty: prev?.qty || 0,
        };
      })
    ),
  });
}
else {
      // GLOBAL → VARIANT
      updateItem({
        pricingMode: "VARIANT",
        variants: sizes.flatMap((size) =>
          colors.map((color) => {
            const last = product.variantPrices?.find(
              (v) => v.size === size && v.color === color
            );

            return {
              size,
              color,
              qty: 0,
              costPrice: last ? last.costPrice : 0,
              salePrice: last ? last.salePrice : 0,
            };
          })
        ),
      });
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{product.name}</h4>
            <p className="text-sm text-gray-500">
              {sizes.length} sizes × {colors.length} colors
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            setItems((prev) => prev.filter((_, i) => i !== index))
          }
          className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-150 group"
          aria-label="Remove product"
        >
          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-150" />
        </button>
      </div>

      {/* PRICING MODE TOGGLE */}
      <div className="bg-linear-to-r from-gray-50 to-gray-25 rounded-xl p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-6 rounded-full transition-all duration-300 ${item.pricingMode === "GLOBAL" ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${item.pricingMode === "GLOBAL" ? 'left-7' : 'left-1'}`} />
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-900">Global pricing</span>
              <p className="text-sm text-gray-500">
                {item.pricingMode === "GLOBAL" 
                  ? "Same price for all variants" 
                  : "Set prices individually per variant"}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={item.pricingMode === "GLOBAL"}
            onChange={(e) => togglePricingMode(e.target.checked)}
            className="hidden"
          />
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.pricingMode === "GLOBAL" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
            {item.pricingMode === "GLOBAL" ? "ON" : "OFF"}
          </span>
        </label>
      </div>

      {/* GLOBAL PRICE SECTION */}
      {item.pricingMode === "GLOBAL" && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <h5 className="font-semibold text-gray-900">Global Price</h5>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price
              </label>
              <div className="relative">
                
                <input
                  type="number"
                  placeholder="0.00"
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
                  value={item.globalPrice.costPrice}
                  onChange={(e) =>
                    updateItem({
                      globalPrice: {
                        ...item.globalPrice,
                        costPrice: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price
              </label>
              <div className="relative">
               
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
                  value={item.globalPrice.salePrice}
                  onChange={(e) =>
                    updateItem({
                      globalPrice: {
                        ...item.globalPrice,
                        salePrice: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MATRIX TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-gray-50 to-gray-25">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-900 border-r border-gray-200">
                  Size
                </th>
                {colors.map((c) => (
                  <th
                    key={c}
                    className="p-4 text-center font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span>{c}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sizes.map((size) => (
                <tr
                  key={size}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="p-4 font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="font-semibold">{size}</span>
                      </div>
                    </div>
                  </td>

                  {colors.map((color) => {
                    const v = findVariant(size, color);

                    return (
                      <td
                        key={color}
                        className="p-4 border-r border-gray-200 last:border-r-0"
                      >
                        <div className="space-y-3">
                          {/* Quantity Input */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              onWheel={(e) => e.currentTarget.blur()}
                              min="0"
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 text-center"
                              value={v?.qty ?? ""}
                              onChange={(e) =>
                                updateVariant(size, color, {
                                  qty: Math.max(Number(e.target.value), 0),
                                })
                              }
                            />
                          </div>

                          {/* Variant Price Inputs */}
                          {item.pricingMode === "VARIANT" && (
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Cost
                                </label>
                                <div className="relative">
                                  
                                  <input
                                    type="number"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    min="0"
                                    placeholder="0.00"
                                    className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                                    value={v?.costPrice ?? ""}
                                    onChange={(e) =>
                                      updateVariant(size, color, {
                                        costPrice: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Sale
                                </label>
                                <div className="relative">
                                 
                                  <input
                                    type="number"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    min="0"
                                    placeholder="0.00"
                                    className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200"
                                    value={v?.salePrice ?? ""}
                                    onChange={(e) =>
                                      updateVariant(size, color, {
                                        salePrice: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER SUMMARY */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {item.pricingMode === "GLOBAL" ? (
            "Global pricing applied to all variants"
          ) : (
            <span>
              Individual pricing for <span className="font-medium text-gray-900">{sizes.length * colors.length}</span> variants
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            {item.variants.filter(v => v.qty > 0).length} variants with stock
          </span>
        </div>
      </div>
    </div>
  );
}
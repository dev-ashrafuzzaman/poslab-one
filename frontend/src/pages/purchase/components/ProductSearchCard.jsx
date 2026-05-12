// purchase/components/ProductSearchCard.jsx
import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";

export default function ProductSearchCard({ items, setItems }) {
  const { request } = useApi();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  /* ======================
     SEARCH PRODUCTS
  ====================== */
  useEffect(() => {
    if (!search) {
      setProducts([]);
      return;
    }

    request(`/products/purchase?search=${search}&limit=10`, "GET").then(
      (res) => setProducts(res?.data || [])
    );
  }, [search]);

  /* ======================
     ADD PRODUCT
  ====================== */
  const addProduct = (product) => {
    const hasLastPrices = product.variantPrices?.length > 0;

    // 🔑 backend decides uniformity
    const pricingMode =
      product.hasVariant &&
      hasLastPrices &&
      product.isUniformLastPrice
        ? "GLOBAL"
        : "VARIANT";

    setItems((prev) =>
      prev.find((p) => p.productId === product._id)
        ? prev
        : [
            ...prev,
            {
              productId: product._id,
              product,
              pricingMode,

              /* ---------- GLOBAL PRICE ---------- */
              globalPrice:
                pricingMode === "GLOBAL"
                  ? {
                      costPrice: product.variantPrices[0].costPrice,
                      salePrice: product.variantPrices[0].salePrice,
                    }
                  : { costPrice: 0, salePrice: 0 },

              /* ---------- VARIANT PRICE ---------- */
              variants:
                pricingMode === "VARIANT"
                  ? product.variantPrices.map((v) => ({
                      size: v.size,
                      color: v.color,
                      qty: 0,
                      costPrice: v.costPrice,
                      salePrice: v.salePrice,
                    }))
                  : [],
            },
          ]
    );

    setSearch("");
    setProducts([]);
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Add Products</h3>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search product name / code"
        className="w-full px-4 py-3 border rounded-lg"
      />

      {products.map((p) => (
        <div
          key={p._id}
          onClick={() => addProduct(p)}
          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
        >
          {p.category.parent} - {p.name} ({p.productCode})
        </div>
      ))}
    </div>
  );
}

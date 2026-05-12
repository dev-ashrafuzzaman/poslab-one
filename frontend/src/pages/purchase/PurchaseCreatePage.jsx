// purchase/PurchaseCreatePage.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import useApi from "../../hooks/useApi";
import useModalManager from "../../hooks/useModalManager";
import BarcodeModal from "../../components/barcode/BarcodeModal";

import PurchaseHeader from "./components/PurchaseHeader";
import SupplierInvoiceCard from "./components/SupplierInvoiceCard";
import ProductSearchCard from "./components/ProductSearchCard";
import ProductMatrixCard from "./components/ProductMatrixCard";
import PurchaseSummaryBar from "./components/PurchaseSummaryBar";

const today = () => new Date().toISOString().split("T")[0];

export default function PurchaseCreatePage() {
  const { request } = useApi();
  const { modals, openModal, closeModal } = useModalManager();

  const [supplier, setSupplier] = useState(null);
  const [items, setItems] = useState([]);
  const [barcodeItems, setBarcodeItems] = useState([]);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: today(),
      paidAmount: 0,
      notes: "",
    },
  });

  const paidAmount = Number(watch("paidAmount")) || 0;

  /* ======================
     TOTAL QTY
  ====================== */
  const totalQty = items.reduce(
    (sum, item) => sum + item.variants.reduce((s, v) => s + v.qty, 0),
    0,
  );

  /* ======================
     TOTAL AMOUNT
  ====================== */
  // =====================
  // CALCULATIONS (LIVE)
  // =====================
  const totalAmount = items.reduce((sum, item) => {
    if (item.pricingMode === "GLOBAL") {
      const totalQty = item.variants.reduce(
        (q, v) => q + Number(v.qty || 0),
        0,
      );

      return sum + totalQty * Number(item.globalPrice.costPrice || 0);
    }

    // VARIANT MODE
    return (
      sum +
      item.variants.reduce(
        (s, v) => s + Number(v.qty || 0) * Number(v.costPrice || 0),
        0,
      )
    );
  }, 0);

  const dueAmount = Math.max(totalAmount - paidAmount, 0);

  /* ======================
     SUBMIT
  ====================== */
  const onSubmit = async (data) => {
    if (!supplier) {
      alert("Please select a supplier");
      return;
    }

    if (!items.length || items.every((i) => i.variants.length === 0)) {
      alert("Please add at least one product with quantity");
      return;
    }

    const payload = {
      supplierId: supplier._id,
      ...data,
      items: items.map((i) => {
        const variants = i.variants
          .filter((v) => v.qty > 0)
          .map((v) => ({
            size: v.size,
            color: v.color,
            qty: v.qty,
            costPrice:
              i.pricingMode === "GLOBAL"
                ? i.globalPrice.costPrice
                : v.costPrice,

            salePrice:
              i.pricingMode === "GLOBAL"
                ? i.globalPrice.salePrice
                : v.salePrice,
          }));

        return {
          productId: i.productId,
          pricingMode: i.pricingMode,
          ...(i.pricingMode === "GLOBAL" && {
            globalPrice: i.globalPrice,
          }),
          variants,
        };
      }),
    };
    await request("/purchases", "POST", payload, {
      successMessage: "Purchase created successfully!",
      onSuccess: (res) => {
        const barcodes = res?.data?.barcodes || [];
        if (barcodes.length) {
          setBarcodeItems(barcodes);
          openModal("purchaseBarcode");
        }
        reset();
        setItems([]);
        setSupplier(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      {modals.purchaseBarcode?.isOpen && (
        <BarcodeModal
          isOpen
          setIsOpen={() => closeModal("purchaseBarcode")}
          barcodes={barcodeItems}
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto p-4 lg:p-6 space-y-6">
        <PurchaseHeader />

        <SupplierInvoiceCard
          register={register}
          supplier={supplier}
          setSupplier={setSupplier}
        />

        <ProductSearchCard items={items} setItems={setItems} />

        {/* ======================
           PRODUCTS
        ====================== */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Products ({items.length})
              </h2>

              <div className="text-sm text-gray-500">
                Total Qty: <span className="font-semibold">{totalQty}</span>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <ProductMatrixCard
                  key={item.productId}
                  index={idx}
                  item={item}
                  setItems={setItems}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================
           EMPTY STATE
        ====================== */}
        {items.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Products Added</h3>
            <p className="text-gray-600">
              Search and add products to start creating your purchase
            </p>
          </div>
        )}

        {/* ======================
           SUMMARY
        ====================== */}
        {items.length > 0 && (
          <PurchaseSummaryBar totalAmount={totalAmount} dueAmount={dueAmount} />
        )}
      </form>
    </div>
  );
}

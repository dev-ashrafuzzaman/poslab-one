import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Layers } from "lucide-react";

import useApi from "../../hooks/useApi";
import useFinancialPayment from "../../utils/useFinancialPayment";
import PurchaseMasterForm from "./components/PurchaseMasterForm";
import PurchaseTableGrid from "./components/PurchaseTableGrid";
import PurchaseFinancialSummary from "./components/PurchaseFinancialSummary";
import FinancialPaymentGate from "../../components/common/FinancialPaymentGate";

export default function PurchaseCreatePage() {
  const { request } = useApi();
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoiceNo: "",
      subject: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      supplier: null,
      shippingCost: "",
      items: [],
    },
  });

  const {
    fields: itemFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items", defaultValue: [] });
  const watchedShippingCost = watch("shippingCost");

  const financialSummary = useMemo(() => {
    const subTotal = watchedItems.reduce((acc, curr) => {
      const q = Math.max(0, parseInt(curr?.qty) || 0);
      const p = Math.max(0, parseFloat(curr?.purchasePrice) || 0);
      return acc + q * p;
    }, 0);

    const parseShipping = parseFloat(watchedShippingCost);
    const shipping =
      isNaN(parseShipping) || parseShipping < 0 ? 0 : parseShipping;
    const grandTotal = subTotal + shipping;

    return { subTotal, grandTotal };
  }, [watchedItems, watchedShippingCost]);

  const paymentHook = useFinancialPayment(financialSummary.grandTotal, {
    allowChange: false,
    allowDue: true,
  });

  const handleProductSelect = (productVariant) => {
    if (!productVariant) return;

    const exists = itemFields.findIndex(
      (i) => i.variantId === productVariant._id,
    );
    const isSerialType =
      productVariant.productTypeName === "serial-product" ||
      productVariant.hasSerial === true;

    if (exists !== -1) {
      if (isSerialType) {
        toast.warning(
          "Already added this product variant. Serial products must be logged separately to secure dynamic data mapping alignment.",
        );
        return;
      }
      const currentQty = parseInt(getValues(`items.${exists}.qty`) || 0);
      handleQtyChange(exists, currentQty + 1);
    } else {
      append({
        productId: productVariant.productId || productVariant.product?._id,
        variantId: productVariant._id,
        sku: productVariant.sku,
        title: productVariant.title,
        model: productVariant.model || "N/A",
        productTypeName: productVariant.productTypeName,
        warrantyName: productVariant.warrantyName || "N/A",
        qty: 1,
        purchasePrice: Math.max(
          0,
          parseFloat(productVariant.purchasePrice) || 0,
        ),
        salePrice: Math.max(0, parseFloat(productVariant.salePrice) || 0),
        serials: isSerialType ? [""] : [],
      });
    }
  };

  const handleQtyChange = (index, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setValue(`items.${index}.qty`, qty);

    const item = getValues(`items.${index}`);
    if (item.productTypeName === "serial-product") {
      const currentSerials = item.serials || [];
      if (qty > currentSerials.length) {
        const diff = qty - currentSerials.length;
        setValue(`items.${index}.serials`, [
          ...currentSerials,
          ...Array(diff).fill(""),
        ]);
      } else if (qty < currentSerials.length) {
        setValue(`items.${index}.serials`, currentSerials.slice(0, qty));
      }
    }
  };

  const onSubmit = async (data) => {
    if (!data.supplier?._id) {
      toast.error(
        "Please assign a valid active supplier entity ledger card tracking index.",
      );
      return;
    }
    if (data.items.length === 0) {
      toast.error(
        "Voucher matrix sheet empty. Select at least one invoice catalog row mapping.",
      );
      return;
    }

    const masterSerialSetRegistry = new Set();
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (item.productTypeName === "serial-product") {
        if (!item.serials || item.serials.length !== parseInt(item.qty)) {
          toast.error(
            `"${item.title}" requires exactly a sum matching of ${item.qty} serialized lines data entry matrix.`,
          );
          return;
        }

        for (let sIdx = 0; sIdx < item.serials.length; sIdx++) {
          const rawCodeString = item.serials[sIdx];

          if (!rawCodeString || rawCodeString.toString().trim() === "") {
            toast.error(
              `Blank String Refused: Line index row entry item matching item #${i + 1} position cell ${sIdx + 1} has an invalid faka data slot.`,
            );
            return;
          }

          const finalizedSanitizedSerial = rawCodeString
            .toString()
            .trim()
            .toUpperCase();
          if (masterSerialSetRegistry.has(finalizedSanitizedSerial)) {
            toast.error(
              `Duplicate Identity Alert: Serial tracking key target label "${finalizedSanitizedSerial}" found embedded in multiple array payload points.`,
            );
            return;
          }
          masterSerialSetRegistry.add(finalizedSanitizedSerial);
        }
      }
    }

    if (!paymentHook.isValid) {
      toast.error(
        "Ledger balance logic error: Please review multi-account debit balancing transaction distribution splits.",
      );
      return;
    }

    setLoading(true);
    const rawCostShippingValue = parseFloat(data.shippingCost);

    const payload = {
      invoiceNo: data.invoiceNo.trim(),
      subject: data.subject?.trim() || "",
      purchaseDate: data.purchaseDate,
      supplierId: data.supplier._id,
      shippingCost:
        isNaN(rawCostShippingValue) || rawCostShippingValue < 0
          ? 0
          : rawCostShippingValue,
      // PurchaseCreatePage.jsx -> onSubmit ফাংশনের ভেতরের payload অবজেক্ট
      paymentInfo: {
        subTotal: financialSummary.subTotal,
        grandTotal: financialSummary.grandTotal,
        paidAmount: parseFloat(paymentHook.paidAmount) || 0, // সেফ কনভার্সন
        dueAmount: parseFloat(paymentHook.remaining) || 0, // সেফ কনভার্সন
        status:
          paymentHook.remaining === 0
            ? "Paid"
            : paymentHook.paidAmount > 0
              ? "Partial"
              : "Unpaid",

        // 💎 ফিক্সড লজিক: splitPayments এর ভেতরের amount অবশ্যই Number হতে হবে
        splitPayments: (paymentHook.payments || []).map((p) => ({
          accountId: p.accountId,
          amount: parseFloat(p.amount) || 0, // 👈 এখানে স্ট্রিং কে নাম্বারে রূপান্তর করা হলো
          method: p.method,
          reference: p.reference?.trim() || "",
        })),
      },
      items: data.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        sku: i.sku,
        qty: parseInt(i.qty),
        purchasePrice: Math.max(0, parseFloat(i.purchasePrice) || 0),
        salePrice: Math.max(0, parseFloat(i.salePrice) || 0),
        productTypeName: i.productTypeName,
        serials:
          i.productTypeName === "serial-product"
            ? i.serials.map((s) => s.toString().trim().toUpperCase())
            : [],
      })),
    };

    try {
      console.log(
        "Submitting validated ERP Master Voucher Blueprint:",
        payload,
      );
      await request("/purchases", "POST", payload, {
        successMessage:
          "Purchase invoice created successfully. Inventory levels updated. Financial ledger entries posted.",
        onSuccess: () => {
          reset();
        },
      });
    } catch (err) {
      toast.error(
        err?.message ||
          "Internal transmission layer failed compiling execution transaction operations.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-4 lg:p-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 select-none">
            <Layers className="size-5 text-blue-600" /> Procurement Purchase
            Invoice Worksheet
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Moving Average Valuation Engine & Automated Financial Ledger System
            Integration.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <PurchaseMasterForm
          register={register}
          errors={errors}
          control={control}
        />

        <PurchaseTableGrid
          itemFields={itemFields}
          watchedItems={watchedItems}
          register={register}
          errors={errors}
          remove={remove}
          getValues={getValues}
          setValue={setValue}
          handleQtyChange={handleQtyChange}
          handleProductSelect={handleProductSelect}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <FinancialPaymentGate
              paymentHookData={paymentHook}
              parentAccountCode="1002"
            />
          </div>

          <PurchaseFinancialSummary
            itemCount={itemFields.length}
            financialSummary={financialSummary}
            paymentHook={paymentHook}
            loading={loading}
            reset={reset}
          />
        </div>
      </form>
    </div>
  );
}

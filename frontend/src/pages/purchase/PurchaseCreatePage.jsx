import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { useMemo, Fragment, useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
  ScanLine,
  FileText,
  Landmark,
  Layers,
  ArrowRight,
  Loader2,
  Calendar,
  Truck,
} from "lucide-react";

import useApi from "../../hooks/useApi";
import SupplierSelect from "../../components/select/SupplierSelect";
import ProductSelect from "../../components/select/ProductSelect";
import Input from "../../components/ui/Input";
import useFinancialPayment from "../../utils/useFinancialPayment";
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
  const watchedShippingCost = watch("shippingCost") || 0;

  const financialSummary = useMemo(() => {
    const subTotal = watchedItems.reduce((acc, curr) => {
      const q = parseInt(curr?.qty || 0);
      const p = parseFloat(curr?.purchasePrice || 0);
      return acc + q * p;
    }, 0);

    const shipping = parseFloat(watchedShippingCost || 0);
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
          "Already added this serial/product variant. For serial products, please add each item separately to ensure unique serial number entry.",
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
        purchasePrice: productVariant.purchasePrice || 0,
        salePrice: productVariant.salePrice || 0,
        serials: isSerialType ? [""] : [],
      });
    }
  };

  const handleQtyChange = (index, value) => {
    const qty = Math.max(0, parseInt(value) || 0);
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

  const handleSerialInputKeyDown = (itemIndex, serialIndex, e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const currentSerials = getValues(`items.${itemIndex}.serials`) || [];
      const currentVal = e.target.value.trim().toUpperCase();

      const isDuplicate = currentSerials.some(
        (s, idx) => s === currentVal && idx !== serialIndex,
      );
      if (isDuplicate) {
        toast.error(`Serial "${currentVal}" is already in the list!`);
        setValue(`items.${itemIndex}.serials.${serialIndex}`, "");
        return;
      }

      setValue(`items.${itemIndex}.serials.${serialIndex}`, currentVal);

      if (serialIndex === currentSerials.length - 1) {
        const currentQty = parseInt(getValues(`items.${itemIndex}.qty`) || 0);
        handleQtyChange(itemIndex, currentQty + 1);

        setTimeout(() => {
          const nextInput = document.getElementById(
            `serial-${itemIndex}-${serialIndex + 1}`,
          );
          nextInput?.focus();
        }, 60);
      }
    }
  };

  const onSubmit = async (data) => {
    if (!data.supplier?._id) {
      toast.error("Please select a valid supplier.");
      return;
    }
    if (data.items.length === 0) {
      toast.error(
        "Purchase Invoice Empty! Minimum one product item is required.",
      );
      return;
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (item.productTypeName === "serial-product") {
        const filteredSerials = item.serials.filter(Boolean);
        if (filteredSerials.length !== item.qty) {
          toast.error(
            `"${item.title}" requires a total of ${item.qty} serial numbers!`,
          );
          return;
        }
      }
    }

    if (!paymentHook.isValid) {
      toast.error(
        "Accounting error: Please resolve payment distribution ledger rules.",
      );
      return;
    }
setLoading(true);
    const payload = {
      invoiceNo: data.invoiceNo,
      subject: data.subject,
      purchaseDate: data.purchaseDate,
      supplierId: data.supplier._id,
      shippingCost: parseFloat(data.shippingCost || 0),
      paymentInfo: {
        subTotal: financialSummary.subTotal,
        grandTotal: financialSummary.grandTotal,
        paidAmount: paymentHook.paidAmount,
        dueAmount: paymentHook.remaining,
        status:
          paymentHook.remaining === 0
            ? "Paid"
            : paymentHook.paidAmount > 0
              ? "Partial"
              : "Unpaid",
        splitPayments: paymentHook.payments,
      },
      items: data.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        sku: i.sku,
        qty: parseInt(i.qty),
        purchasePrice: parseFloat(i.purchasePrice),
        salePrice: parseFloat(i.salePrice || 0),
        serials:
          i.productTypeName === "serial-product"
            ? i.serials.map((s) => s.trim().toUpperCase())
            : [],
      })),
    };

    console.log(payload);
    // await request("/purchases", "POST", payload, {
    //   successMessage: "Purchase Invoice created successfully!",
    //   onSuccess: () => {
    //     reset();
    //setLoading(false);
    //     paymentHook.resetPayment(); 
    //   }
    // });
    setLoading(false);
  };

  return (
    <div className="mx-auto p-4 lg:p-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="size-5 text-blue-600" /> New Procurement Purchase
            Invoice
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Moving Average Valuation & Multi-Account Financial Accounting
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Input
            label="Invoice / Voucher No *"
            placeholder="e.g. PUR-2026-0045"
            prefix={<FileText className="size-4" />}
            error={errors.invoiceNo?.message}
            inputClassName="font-semibold"
            {...register("invoiceNo", {
              required: "Invoice Number is required",
            })}
          />

          <Input
            label="Subject / Reference"
            placeholder="e.g. Bulk Import CCTV Component"
            {...register("subject")}
          />

          <Input
            label="Purchase Date *"
            type="date"
            prefix={<Calendar className="size-4" />}
            error={errors.purchaseDate?.message}
            {...register("purchaseDate", { required: "Date is required" })}
          />

          <div className="w-full">
            <Controller
              control={control}
              name="supplier"
              rules={{ required: "Supplier selection is required" }}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <SupplierSelect
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  allowCreate={false}
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100 items-end">
          <div className="md:col-span-3">
            <ProductSelect
              value={null}
              onChange={handleProductSelect}
              label="Search Catalog Variant to Add Row"
              placeholder="Type Model, Variant Title, Brand or SKU Code..."
            />
          </div>
          <div>
            <Input
              label="Shipping Cost (BDT)"
              type="number"
              step="0.01"
              placeholder="0"
              prefix={<Truck className="size-4 text-blue-600" />}
              onWheel={(e) => e.target.blur()}
              {...register("shippingCost", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-layout-fixed">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="p-3 text-left">
                    Product Specifications & Attributes
                  </th>
                  <th className="p-3 w-25 text-center">Quantity</th>
                  <th className="p-3 w-40">Purchase Price</th>
                  <th className="p-3 w-40">Expected Sale Price</th>
                  <th className="p-3 w-45 text-right">Line Total</th>
                  <th className="p-3 w-17.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {itemFields.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-16 text-gray-400 font-medium"
                    >
                      Barcode Scanning or Product Selection will appear here.
                      Start by adding products to this purchase invoice.
                    </td>
                  </tr>
                ) : (
                  itemFields.map((field, index) => {
                    const isSerialProduct =
                      watchedItems[index]?.productTypeName === "serial-product";
                    const rowQty = watchedItems[index]?.qty || 0;
                    const rowPrice = watchedItems[index]?.purchasePrice || 0;
                    const lineTotal = parseInt(rowQty) * parseFloat(rowPrice);

                    return (
                      <Fragment key={field.id}>
                        <tr className="align-top hover:bg-gray-50/30 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-gray-900">
                              {field.title}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                              SKU: {field.sku} | Model: {field.model} |
                              Warranty: {field.warrantyName}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              className="w-full h-10 px-2 text-sm font-bold border border-gray-300 bg-white text-gray-800 rounded-lg text-center outline-none focus:border-blue-500"
                              value={watchedItems[index]?.qty || 0}
                              onWheel={(e) => e.target.blur()}
                              onChange={(e) =>
                                handleQtyChange(index, e.target.value)
                              }
                            />
                          </td>

                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              prefix={
                                <span className="text-xs text-emerald-600 font-bold">
                                  BDT
                                </span>
                              }
                              inputClassName="font-bold text-emerald-600"
                              showLabel={false}
                              onWheel={(e) => e.target.blur()}
                              error={
                                errors?.items?.[index]?.purchasePrice
                                  ? "Required"
                                  : null
                              }
                              {...register(`items.${index}.purchasePrice`, {
                                required: true,
                                valueAsNumber: true,
                              })}
                            />
                          </td>

                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              prefix={
                                <span className="text-xs text-blue-600 font-bold">
                                  BDT
                                </span>
                              }
                              inputClassName="text-blue-600 font-semibold"
                              placeholder="Retail"
                              showLabel={false}
                              onWheel={(e) => e.target.blur()}
                              {...register(`items.${index}.salePrice`, {
                                valueAsNumber: true,
                              })}
                            />
                          </td>

                          <td className="p-3">
                            <Input
                              type="text"
                              value={
                                lineTotal
                                  ? Number(lineTotal.toFixed(2)).toString()
                                  : "0"
                              }
                              suffix={
                                <span className="text-xs font-bold text-gray-400">
                                  BDT
                                </span>
                              }
                              inputClassName="font-bold text-gray-900 text-right pr-1"
                              showLabel={false}
                              disabled={true}
                              className="bg-gray-50 select-none cursor-not-allowed opacity-90"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>

                        {isSerialProduct && (
                          <tr className="bg-purple-50/10">
                            <td
                              colSpan={6}
                              className="p-3 border-b border-gray-200"
                            >
                              <div className="bg-white p-3  w-full">
                                <div className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1 select-none">
                                  <ScanLine className="size-3.5 text-purple-600" />
                                  Scan / Enter Unique Serial or IMEI Numbers for
                                  "{field.title}-{field.sku}":
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2 w-full">
                                  {(watchedItems[index]?.serials || [""])?.map(
                                    (serial, sIdx) => (
                                      <div
                                        key={sIdx}
                                        className="relative flex items-center h-8 w-full"
                                      >
                                        <span className="absolute left-1.5 text-[9px] font-mono font-bold text-purple-500 bg-purple-50 px-1 rounded z-10 select-none scale-90">
                                          #{sIdx + 1}
                                        </span>
                                        <input
                                          id={`serial-${index}-${sIdx}`}
                                          type="text"
                                          placeholder="Serial..."
                                          {...register(
                                            `items.${index}.serials.${sIdx}`,
                                            { required: true },
                                          )}
                                          onKeyDown={(e) =>
                                            handleSerialInputKeyDown(
                                              index,
                                              sIdx,
                                              e,
                                            )
                                          }
                                          className="w-full h-8 pl-7 pr-1 text-[11px] border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-600 font-mono uppercase font-bold text-purple-950 bg-purple-50/30"
                                        />
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 h-full bg-gray-50 p-5 rounded-xl border border-gray-200">
            <FinancialPaymentGate
              paymentHookData={paymentHook}
              parentAccountCode="1002"
            />
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-4 shadow-sm sticky top-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
              Invoice Financial Breakdown
            </h3>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Total Item Rows:</span>
                <span className="font-bold text-xl text-gray-900">
                  {itemFields.length}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Sub-Total (Products):</span>
                <span className="font-bold text-xl text-gray-900">
                  {financialSummary.subTotal
                    ? Number(financialSummary.subTotal.toFixed(2)).toString()
                    : "0"}{" "}
                  ৳
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Shipping / Logistics:</span>
                <span className="font-bold text-xl text-amber-600">
                  (+){" "}
                  {watchedShippingCost
                    ? Number(
                        parseFloat(watchedShippingCost).toFixed(2),
                      ).toString()
                    : "0"}{" "}
                  ৳
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-2 text-gray-900">
                <span className="font-bold text-xs uppercase">
                  Grand Total Cost:
                </span>
                <span className="text-xl font-black text-emerald-600">
                  {financialSummary.grandTotal
                    ? Number(financialSummary.grandTotal.toFixed(2)).toString()
                    : "0"}{" "}
                  ৳
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600 border-t border-gray-100 pt-2">
                <span>Ledger Paid Amount:</span>
                <span className="font-bold text-xl text-blue-600">
                  {paymentHook.paidAmount
                    ? Number(paymentHook.paidAmount.toFixed(2)).toString()
                    : "0"}{" "}
                  ৳
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                <span className="font-bold text-xs uppercase text-gray-700">
                  Net Due Ledger:
                </span>
                <span
                  className={`text-xl font-black ${paymentHook.remaining > 0 ? "text-red-600" : "text-gray-400"}`}
                >
                  {paymentHook.remaining
                    ? Number(paymentHook.remaining.toFixed(2)).toString()
                    : "0"}{" "}
                  ৳
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Processing
                    Invoice...
                  </>
                ) : (
                  <>
                    Post Purchase Invoice <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  reset();
                  paymentHook.resetPayment();
                }}
                className="text-center text-xs text-gray-500 hover:text-red-600 transition-colors py-2 font-medium"
              >
                Reset Invoice & Flush Gate
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

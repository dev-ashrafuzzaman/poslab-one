import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import Page from "../../../components/common/Page";
import VariantCreateModal from "./VariantCreateModal";
import DataTable from "../../../components/table/DataTable";
import { BarcodeIcon } from "lucide-react";

const VariantPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/variants");

  return (
    <Page
      title="Product Variants Matrix"
      subTitle="Manage and monitor your organization's CCTV, Electronic, and IT inventory stocks."
    >
      {modals.addVariant?.isOpen && (
        <VariantCreateModal
          isOpen={modals.addVariant.isOpen}
          setIsOpen={() => closeModal("addVariant")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Product Inventory Stock"
        columns={[
          {
            key: "sku",
            label: "SKU / Barcode",
            render: (r) => (
              <div className="flex flex-col gap-0.5 py-1">
                <span className="font-bold text-slate-800 text-[13px] tracking-wide">
                  {r.sku}
                </span>
                {r.barcode ? (
                  <span className="text-[11px] font-medium text-slate-500 ">
                    BC: {r.barcode}
                  </span>
                ) : (
                  <span className="text-[11px] font-normal text-slate-400 italic">
                    No Barcode
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "title",
            label: "Product Specification & Details",
            render: (r) => (
              <div className="max-w-md py-1">
                <span className="text-sm font-semibold text-slate-900 block leading-snug hover:text-blue-600 transition-colors truncate">
                  {r.title || "—"}
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[11px] text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    Model: {r.model || "Universal"}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-medium text-blue-700 bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100">
                    {r.attributes?.attributeName || "Specification"}:{" "}
                    <strong className="ps-1 font-bold text-blue-900">
                      {r.attributes?.attributeValue || "Base"}
                    </strong>
                  </span>
                  {r.warrantyName && (
                    <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      {r.warrantyName}
                    </span>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "productTypeName",
            label: "Classification",
            render: (r) => (
              <div className="flex flex-col gap-1 py-1 text-[13px]">
                <div className="flex items-center gap-1 text-slate-700">
                  {/* <span className="text-xs text-slate-400 font-normal">Type:</span> */}
                  <span className="font-semibold text-slate-800">
                    {r.productTypeName || "—"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center flex-wrap gap-0.5">
                  <span className="text-slate-700 font-medium">
                    {r.parentCategoryName || "—"}
                  </span>
                  {r.subCategoryName && (
                    <>
                      <span className="text-slate-400 font-normal mx-0.5">
                        →
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {r.subCategoryName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "salePrice",
            label: "Pricing (BDT)",
            render: (r) => (
              <div className="flex flex-col text-right pr-4 py-1">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                  ৳ {Number(r?.salePrice || 0).toLocaleString("en-IN")}/-
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Cost: {Number(r?.costPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
            ),
          },
          {
            key: "createdAt",
            label: "Registered",
          },
        ]}
        actions={[
          { type: "edit", label: "Edit Variation" },
        ]}
      />
    </Page>
  );
};

export default VariantPage;

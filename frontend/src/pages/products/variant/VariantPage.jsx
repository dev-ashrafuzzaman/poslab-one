import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import Page from "../../../components/common/Page";
import VariantCreateModal from "./VariantCreateModal";
import DataTable from "../../../components/table/DataTable";

const VariantPage = () => {
  const { modals, openModal, closeModal } = useModalManager();

  const table = useTableManager("/variants");

  return (
    <Page
      title="Product Variants"
      subTitle="Manage your organization product stock variations"
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
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">
                  {r.sku}
                </span>
                {r.barcode && (
                  <span className="text-xs text-slate-400 font-medium tracking-tight">
                    BC: {r.barcode}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "title",
            label: "Product Description Specification",
            render: (r) => (
              <div className="max-w-md">
                <span className="text-sm font-semibold text-slate-900 block leading-snug">
                  {r.title || "—"}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {" "}
                  <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                    Model: {r.model || "Universal Model"}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-medium text-blue-700 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/50 w-fit">
                    {r.attributes.attributeName}:{" "} 
                    <strong className="ps-1">{r.attributes.attributeValue}</strong>
                  </span>
                  {r.warrantyName && (
                    <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50/60 px-2 py-0.5 rounded border border-amber-100/50 w-fit">
                      {r.warrantyName}
                    </span>
                  )}
                </div>
              </div>
            ),
          },

          {
            key: "salePrice",
            label: "Pricing / Costing",
            render: (r) => (
              <div className="flex flex-col text-right pr-4">
                <span className="text-sm font-bold text-slate-900">
                  {Number(r?.salePrice || 0).toLocaleString()} BDT
                </span>
                <span className="text-[11px] text-slate-400">
                  Cost: {Number(r?.purchasePrice || 0).toLocaleString()} BDT
                </span>
              </div>
            ),
          },
          {
            key: "stock",
            label: "Available Stock",
            render: (r) => (
              <div className="text-center">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    (r.stock || 0) > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {r.stock || 0} Units
                </span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`status ${
                  r.status === "active" ? "approved" : "rejected"
                }`}
              >
                {r.status === "active" ? "Active" : "Inactive"}
              </span>
            ),
          },
          { key: "createdAt", label: "Registered" },
        ]}
        actions={[
          { type: "edit", label: "Edit Variation" },
          {
            type: "status",
            label: "Change Lifecycle Status",
            api: (row) => `/variants/${row._id}/status`, // আপনার প্রজেক্ট রাউটার এপিআই পাথ
          },
        ]}
      />
    </Page>
  );
};

export default VariantPage;

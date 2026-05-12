import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import Page from "../../../components/common/Page";
import VariantCreateModal from "./VariantCreateModal";
import DataTable from "../../../components/table/DataTable";

const VariantPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/variants");

  return (
    <Page title="Variants" subTitle="Manage your organization variants">
      {modals.addVariant?.isOpen && (
        <VariantCreateModal
          isOpen={modals.addVariant.isOpen}
          setIsOpen={() => closeModal("addVariant")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Variants"
        // headerActions={[
        //   {
        //     variant: "gradient",
        //     label: "Add Variant",
        //     onClick: () => openModal("addVariant"),
        //   },
        // ]}
        columns={[
          { key: "sku", label: "SKU" },
          {
            key: "product",
            label: "Product",
            render: (r) => r.product?.name || "—",
          },
          {
            key: "category",
            label: "Category",
            render: (r) => (
              <span className="text-sm">
                {r.category?.parent?.name && (
                  <span className="text-gray-500">
                    {r.category.parent.name} →
                  </span>
                )}
                <strong className="ml-1">{r.category?.sub?.name}</strong>
              </span>
            ),
          },
          {
            key: "attributes",
            label: "Attributes",
            render: (r) => (
              <div className="flex gap-2 text-xs">
                {r.attributes?.size && (
                  <span className="badge">Size: {r.attributes.size}</span>
                )}
                {r.attributes?.color && (
                  <span className="badge">Color: {r.attributes.color}</span>
                )}
              </div>
            ),
          },
          {
            key: "salePrice",
            label: "Sale Price",
            render: (r) => `${r?.salePrice || 0} BDT`,
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`status ${
                  r.status === "active" ? "approved" : "rejected"
                }`}>
                {r.status === "active" ? "Active" : "Inactive"}
              </span>
            ),
          },
          { key: "createdAt", label: "Created At" },
        ]}
        actions={
          [
            // { type: "edit", label: "Edit" },
            // {
            //   type: "status",
            //   label: "Change Status",
            //   api: (row) => `/variants/${row._id}/status`,
            // },
            // {
            //   type: "delete",
            //   label: "Delete",
            //   api: (row) => `/variants/${row._id}`,
            // },
          ]
        }
      />
    </Page>
  );
};

export default VariantPage;

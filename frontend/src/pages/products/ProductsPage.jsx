import DataTable from "../../components/table/DataTable";
import useModalManager from "../../hooks/useModalManager";
import useTableManager from "../../hooks/useTableManager";
import Page from "../../components/common/Page";
import ProductCreateModal from "./ProductCreateModal";

const ProductsPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/products");
  return (
    <Page title="Products" subTitle="Manage your organization products">
      {modals.addProduct?.isOpen && (
        <ProductCreateModal
          isOpen={modals.addProduct.isOpen}
          setIsOpen={() => closeModal("addProduct")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Products"
        headerActions={[
          {
            variant: "gradient",
            label: "Add Product",
            onClick: () => openModal("addProduct"),
          },
        ]}
        columns={[
          { key: "productCode", label: "productCode" },
          { key: "name", label: "Name" },
          { key: "unit", label: "Unit" },
          {
            key: "category",
            label: "Category",
            render: (r) => (
              <span className="text-sm">
                {r.category?.parent && (
                  <span className="text-gray-500">{r.category.parent} →</span>
                )}
                <strong className="ml-1">{r.category?.sub}</strong>
              </span>
            ),
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
          // { key: "createdAt", label: "Created At" },
        ]}
        actions={[
          // { type: "edit", label: "Edit" },
          {
            type: "status",
            label: "Change Status",
            api: (row) => `/products/${row._id}/status`,
          },
          // {
          //   type: "delete",
          //   label: "Delete",
          //   api: (row) => `/products/${row._id}`,
          // },
        ]}
      />
    </Page>
  );
};

export default ProductsPage;

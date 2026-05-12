import SupplierCreateModal from "./SupplierCreateModal";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";

const SupplierPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/suppliers");
  return (
    <Page title="Suppliers" subTitle="Manage your organization suppliers">
      {modals.addSupplier?.isOpen && (
        <SupplierCreateModal
          isOpen={modals.addSupplier.isOpen}
          setIsOpen={() => closeModal("addSupplier")}
          refetch={table.refetch}
        />
      )}
      <DataTable
        table={table}
        title="Suppliers"
        headerActions={[{variant: "gradient", label: "Add Supplier", onClick: () => openModal("addSupplier")}]}
        columns={[
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
          { key: "contact.name", label: "Contact Name" },
          { key: "contact.phone", label: "Contact Phone" },
          { key: "address", label: "Address" },
          { key: "createdAt", label: "Created At" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`${
                  r.status === "active" ? "status approved" : "status rejected"
                }`}>
                {r.status === "active" ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]}
        actions={[
          // { type: "view", label: "View" },
          // { type: "edit", label: "Edit" },
          // {
          //   type: "status",
          //   label: "Change Status",
          //   api: (row) => `/suppliers/${row._id}/status`,
          // },
          // {
          //   type: "delete",
          //   label: "Delete",
          //   api: (row) => `/suppliers/${row._id}`,
          //   hidden: (row) => row.isSystem === true,
          // },
        ]}
      />
    </Page>
  );
};

export default SupplierPage;
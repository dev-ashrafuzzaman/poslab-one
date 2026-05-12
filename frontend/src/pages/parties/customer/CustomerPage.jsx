import CustomerCreateModal from "./CustomerCreateModal";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";

const CustomerPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/customers");
  return (
    <Page title="Customers" subTitle="Manage your organization customers">
      {modals.addCustomer?.isOpen && (
        <CustomerCreateModal
          isOpen={modals.addCustomer.isOpen}
          setIsOpen={() => closeModal("addCustomer")}
          refetch={table.refetch}
        />
      )}
      <DataTable
        table={table}
        title="Customers"
        headerActions={[{variant: "gradient", label: "Add Customer", onClick: () => openModal("addCustomer")}]}
        columns={[
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
          { key: "address", label: "Address" },
          { key: "phone", label: "Phone" },
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
          //   api: (row) => `/customers/${row._id}/status`,
          // },
          // {
          //   type: "delete",
          //   label: "Delete",
          //   api: (row) => `/customers/${row._id}`,
          //   hidden: (row) => row.isSystem === true,
          // },
        ]}
      />
    </Page>
  );
};

export default CustomerPage;
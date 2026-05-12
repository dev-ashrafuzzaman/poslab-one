import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import WarrantyCreateModal from "./WarrantyCreateModal";

const WarrantyPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/utils?type=warranty");

  return (
    <Page title="Warranty" subTitle="Manage your organization warranty">
      {modals.addWarranty?.isOpen && (
        <WarrantyCreateModal
          isOpen={modals.addWarranty.isOpen}
          setIsOpen={() => closeModal("addWarranty")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Warranty"
        headerActions={[
          {
            variant: "gradient",
            label: "Add Warranty",
            onClick: () => openModal("addWarranty"),
          },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "durationDays", label: "Duration Days" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`${
                  r.status === "active" ? "status approved" : "status rejected"
                }`}
              >
                {r.status === "active" ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Created At",
          },
        ]}
        // actions={[
        //   {
        //     type: "delete",
        //     label: "Delete",
        //     api: (row) => `/utils/${row._id}`,
        //   },
        // ]}
      />
    </Page>
  );
};

export default WarrantyPage;

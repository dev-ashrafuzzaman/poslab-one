import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import UnitCreateModal from "./UnitCreateModal";

const UnitPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/utils?type=unit");

  return (
    <Page title="Units" subTitle="Manage your organization units">
      {modals.addUnit?.isOpen && (
        <UnitCreateModal
          isOpen={modals.addUnit.isOpen}
          setIsOpen={() => closeModal("addUnit")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Units"
        headerActions={[
          {
            variant: "gradient",
            label: "Add Unit",
            onClick: () => openModal("addUnit"),
          },
        ]}
        columns={[
          { key: "name", label: "Name" },
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
          {
            key: "createdAt",
            label: "Created At",
          },
        ]}
        // actions={
        //   [
        //     {
        //       type: "delete",
        //       label: "Delete",
        //       api: (row) => `/utils/${row._id}`,
        //     },
        //   ]
        // }
      />
    </Page>
  );
};

export default UnitPage;

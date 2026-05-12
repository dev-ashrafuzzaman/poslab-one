import BranchCreateModal from "./BranchCreateModal";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";

const BranchesPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/branches");
  return (
    <Page title="Branches" subTitle="Manage your organization branches">
      {modals.addBranch?.isOpen && (
        <BranchCreateModal
          isOpen={modals.addBranch.isOpen}
          setIsOpen={() => closeModal("addBranch")}
          refetch={table.refetch}
        />
      )}
      <DataTable
        table={table}
        title="Branches"
        headerActions={[{variant: "gradient", label: "Add Branch", onClick: () => openModal("addBranch")}]}
        columns={[
          { key: "code", label: "Code" },
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
        ]}
        actions={[
          // { type: "view", label: "View" },
          // { type: "edit", label: "Edit" },
          // {
          //   type: "status",
          //   label: "Change Status",
          //   api: (row) => `/api/v1/branches/${row._id}/status`,
          // },
          // {
          //   type: "delete",
          //   label: "Delete",
          //   api: (row) => `/branches/${row._id}`,
          //   hidden: (row) => row.isSystem === true,
          // },
        ]}
      />
    </Page>
  );
};

export default BranchesPage;

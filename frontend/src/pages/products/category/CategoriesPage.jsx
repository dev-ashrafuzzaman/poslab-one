import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import CategoryCreateModal from "./CategoryCreateModal";

const CategoriesPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/categories");

  return (
    <Page title="Categories" subTitle="Manage your organization categories">
      {modals.addCategory?.isOpen && (
        <CategoryCreateModal
          isOpen={modals.addCategory.isOpen}
          setIsOpen={() => closeModal("addCategory")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Categories"
        headerActions={[
          {
            variant: "gradient",
            label: "Add Category",
            onClick: () => openModal("addCategory"),
          },
        ]}
        columns={[
          { key: "name", label: "Name" },
          // {
          //   key: "level",
          //   label: "Level",
          //   render: (r) => `Level ${r.level}`,
          // },
          { key: "parentName", label: "Parent Category" },
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
        actions={
          [
            // { type: "edit", label: "Edit" },
            // {
            //   type: "status",
            //   label: "Change Status",
            //   api: (row) => `/categories/${row._id}/status`,
            // },
            // {
            //   type: "delete",
            //   label: "Delete",
            //   api: (row) => `/categories/${row._id}`,
            // },
          ]
        }
      />
    </Page>
  );
};

export default CategoriesPage;

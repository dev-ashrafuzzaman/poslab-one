import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import BrandCreateModal from "./BrandCreateModal";

const UnitPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/utils?type=brand");

  return (
    <Page title="Brand" subTitle="Manage your organization brand">
      {modals.addBrand?.isOpen && (
        <BrandCreateModal
          isOpen={modals.addBrand.isOpen}
          setIsOpen={() => closeModal("addBrand")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Brand"
        headerActions={[
          {
            variant: "gradient",
            label: "Add Brand",
            onClick: () => openModal("addBrand"),
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

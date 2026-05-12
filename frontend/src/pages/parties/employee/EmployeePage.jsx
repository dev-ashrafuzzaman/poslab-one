import EmployeeCreateModal from "./EmployeeCreateModal";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";

const EmployeePage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/employees");
  return (
    <Page title="Employees" subTitle="Manage your organization employees">
      {modals.addEmployee?.isOpen && (
        <EmployeeCreateModal
          isOpen={modals.addEmployee.isOpen}
          setIsOpen={() => closeModal("addEmployee")}
          refetch={table.refetch}
        />
      )}
      <DataTable
        table={table}
        title="Employees"
        headerActions={[{variant: "gradient", label: "Add Employee", onClick: () => openModal("addEmployee")}]}
        columns={[
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "role", label: "Role" },
          { key: "payroll.commissionValue", label: "Com. Value" },
          { key: "designation", label: "Designation" },
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
          //   api: (row) => `/employees/${row._id}/status`,
          // },
          // {
          //   type: "delete",
          //   label: "Delete",
          //   api: (row) => `/employees/${row._id}`,
          //   hidden: (row) => row.isSystem === true,
          // },
        ]}
      />
    </Page>
  );
};

export default EmployeePage;

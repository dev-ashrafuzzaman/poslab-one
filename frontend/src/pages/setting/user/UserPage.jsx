import UserCreateModalPage from "./UserCreateModalPage";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";

const UsersPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/users");
  return (
    <Page title="Users" subTitle="Manage your organization users">
      {modals.createUser?.isOpen && (
        <UserCreateModalPage
          isOpen={modals.createUser.isOpen}
          setIsOpen={() => closeModal("createUser")}
          refetch={table.refetch}
        />
      )}
      <DataTable
        table={table}
        title="Users"
        headerActions={[{variant: "gradient", label: "Add User", onClick: () => openModal("createUser")}]}
        columns={[
          { key: "email", label: "Email" },
          { key: "name", label: "Name" },
          { key: "roleName", label: "Role" },
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
          {
            type: "status",
            label: "Change Status",
            api: (row) => `/users/${row._id}/status`,
          },
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

export default UsersPage;

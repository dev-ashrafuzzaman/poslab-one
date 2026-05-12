import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";
import { useAuth } from "../../../context/useAuth";
import { useState } from "react";
import AccountTransferCreateModal from "./AccountTransferCreateModal";
import AccountTransferReceiveModal from "./AccountTransferReceiveModal";

const AccountTransferPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const table = useTableManager("/account-transfer");

  const { user } = useAuth();
  const handleReceive = async (row) => {
    setSelectedTransfer(row);
    openModal("receiveAccountTransfer");
  };

  return (
    <Page
      title="Account Transfers"
      subTitle="Manage Account to Account transfers"
    >
      {modals.createAccountTransfer?.isOpen && (
        <AccountTransferCreateModal
          isOpen={modals.createAccountTransfer.isOpen}
          setIsOpen={() => closeModal("createAccountTransfer")}
          refetch={table.refetch}
        />
      )}
      {modals.receiveAccountTransfer?.isOpen && (
        <AccountTransferReceiveModal
          isOpen={modals.receiveAccountTransfer.isOpen}
          setIsOpen={() => closeModal("receiveAccountTransfer")}
          refetch={table.refetch}
          transfer={selectedTransfer}
        />
      )}

      <DataTable
        table={table}
        title="Account Transfers"
        headerActions={[
          {
            variant: "gradient",
            label: "Create Account Transfer",
            onClick: () => openModal("createAccountTransfer"),
          },
        ]}
        columns={[
          { key: "transferCode", label: "Transfer Code" },
          { key: "amount", label: "Amount" },
          { key: "fromBranchName", label: "From Branch" },
          { key: "toBranchName", label: "To Branch" },

          { key: "createdByName", label: "Created By" },
          { key: "createdAt", label: "Created Date" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`${
                  r.status === "PENDING" ? "status rejected" : "status approved"
                }`}
              >
                {r.status}
              </span>
            ),
          },
          {
            key: "action",
            label: "Action",
            render: (row) => {
              const canReceive =
                row.status === "PENDING" &&
                ["Accountant","Super Admin", "Admin"].includes(user.roleName);

              if (!canReceive) return null;

              return (
                <button
                  onClick={() => handleReceive(row)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
                >
                  Receive
                </button>
              );
            },
          },
        ]}
      />
    </Page>
  );
};

export default AccountTransferPage;

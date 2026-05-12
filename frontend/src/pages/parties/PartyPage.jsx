import DataTable from "../../components/table/DataTable";
import useModalManager from "../../hooks/useModalManager";
import useTableManager from "../../hooks/useTableManager";
import Page from "../../components/common/Page";

import PartyCreateModal from "./PartyCreateModal";
import PartyEditModal from "./PartyEditModal";
import { useState } from "react";

export default function PartyPage({ config }) {
  const { modals, openModal, closeModal } = useModalManager();

  const table = useTableManager(config.api);
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <Page title={config.title} subTitle={`Manage ${config.title}`}>
      {modals.addParty?.isOpen && (
        <PartyCreateModal
          config={config}
          isOpen={modals.addParty.isOpen}
          setIsOpen={() => closeModal("addParty")}
          refetch={table.refetch}
        />
      )}

      {modals.editParty?.isOpen && (
        <PartyEditModal
          row={selectedRow}
          config={config}
          isOpen={modals.editParty.isOpen}
          setIsOpen={() => closeModal("editParty")}
          refetch={table.refetch}
        />
      )}
      <DataTable
        table={table}
        title={config.title}
        columns={[
          {
            key: "code",
            label: "Code",
          },

          {
            key: "name",
            label: "Name",
          },

          {
            key: "phone",
            label: "Phone",
          },

          {
            key: "currentBalance",
            label: "Balance",

            render: (row) => <span>৳ {row.currentBalance || 0}</span>,
          },

          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span
                className={`${
                  row.status === "active"
                    ? "status approved"
                    : "status rejected"
                }`}
              >
                {row.status}
              </span>
            ),
          },

          {
            key: "createdAt",
            label: "Created At",

            render: (row) => (
              <span>{new Date(row.createdAt).toLocaleDateString()}</span>
            ),
          },
        ]}
        headerActions={[
          {
            variant: "gradient",
            label: config.createLabel,
            onClick: () => openModal("addParty"),
          },
        ]}
        actions={[
          {
            type: "edit",
            label: "Edit",
            onClick: (row) => {
              setSelectedRow(row);
              openModal("editParty");
            },
          },

          {
            type: "status",
            label: "Change Status",

            api: (row) => `/parties/${row._id}/status`,
          },

          {
            type: "delete",
            label: "Delete",

            api: (row) => `/parties/${row._id}`,
          },
        ]}
      />
    </Page>
  );
}

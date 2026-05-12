import { useNavigate } from "react-router-dom";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";
import MembershipCreateModal from "./MembershipCreateModal";

const MembershipPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/memberships");
  const navigate = useNavigate();

  const goToOverview = (row) => {

    navigate(`/memberships/${row.customerId}`);
  };

  return (
    <Page title="Memberships" subTitle="Manage your organization memberships">
      {modals.createMembership?.isOpen && (
        <MembershipCreateModal
          isOpen={modals.createMembership.isOpen}
          setIsOpen={() => closeModal("createMembership")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Memberships"
        headerActions={[
          {
            variant: "gradient",
            label: "Create Membership",
            onClick: () => openModal("createMembership"),
          },
        ]}
        columns={[
          { key: "code", label: "Membership Code" },

          {
            key: "branchName",
            label: "Branch",
            render: (r) => (
              <div className="font-medium">{r.branchName}</div>
            ),
          },

          { key: "name", label: "Customer Name" },
          { key: "phone", label: "Phone" },

          {
            key: "createdAt",
            label: "Created At",
            render: (r) =>
              new Date(r.createdAt).toLocaleDateString("en-GB"),
          },

          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`status ${
                  r.status === "ACTIVE"
                    ? "approved"
                    : r.status === "PENDING"
                    ? "pending"
                    : "rejected"
                }`}
              >
                {r.status}
              </span>
            ),
          },

          /* 🔥 OVERVIEW ACTION */
          {
            key: "_action",
            label: "Overview",
            render: (row) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToOverview(row);
                }}
                className="px-3 py-1.5 rounded-md text-sm font-medium
                           text-blue-600 hover:bg-blue-50"
              >
                View
              </button>
            ),
          },
        ]}
      />
    </Page>
  );
};

export default MembershipPage;

import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";
import LoyaltySettingUpdateModal from "./LoyaltySettingUpdateModal";
import { useState } from "react";

const LoyaltySettingPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const table = useTableManager("/memberships/loyalty");
  const handleUpdate = (row) => {
    openModal("updateLoyalty", {row});
  };

  return (
    <Page title="Loyalty" subTitle="Manage your organization Loyalty">
      {modals.updateLoyalty?.isOpen && (
        <LoyaltySettingUpdateModal
          isOpen={modals.updateLoyalty.isOpen}
          setIsOpen={() => closeModal("updateLoyalty")}
          row={modals.updateLoyalty?.payload?.row}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Loyalty Settings"
        columns={[
          { key: "productDiscountPercent", label: "Member %" },
          { key: "maxRewardValue", label: "Max Reward" },
          { key: "minActivationAmount", label: "Activation Amount" },
          { key: "minDailyPurchase", label: "Min Daily Purchase" },
          { key: "requiredCount", label: "Required Count" },

          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`status ${
                  r.status === "ACTIVE" ? "approved" : "rejected"
                }`}
              >
                {r.status}
              </span>
            ),
          },

          /* 🔥 ACTION COLUMN */
          {
            key: "_actions",
            label: "Action",
            render: (row) => (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUpdate(row);
                }}
                className="px-3 py-1.5 rounded-md text-sm font-medium
                           text-blue-600 hover:bg-blue-50"
              >
                Edit
              </button>
            ),
          },
        ]}
      />
    </Page>
  );
};

export default LoyaltySettingPage;

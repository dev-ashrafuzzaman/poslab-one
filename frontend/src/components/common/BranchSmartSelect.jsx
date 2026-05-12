import { useEffect, useState, useCallback } from "react";
import useApi from "../../hooks/useApi";
import ReportSmartSelect from "./ReportSmartSelect";
import { useAuth } from "../../context/useAuth";

/**
 * BranchSmartSelect (Enterprise Version)
 *
 * Features:
 * - Role-based auto selection
 * - Auto select by branchId prop
 * - Lock for manager/cashier
 * - Admin manual selection
 * - Fully reusable
 */

export default function BranchSmartSelect({
  value,
  onChange,
  branchId,          // optional auto select
  disabled = false,
  required = false,
}) {
  const { user } = useAuth();
  const { request } = useApi();

  const [autoSelectedBranch, setAutoSelectedBranch] = useState(null);
  const [loadingBranch, setLoadingBranch] = useState(false);

  const isAdmin = user?.role === "Admin";
  const isManager = user?.role === "Branch Manager";
  const isCashier = user?.role === "Cashier";

  /* ======================================
     Auto Select for Manager / Cashier
  ====================================== */
  useEffect(() => {
    const loadAssignedBranch = async () => {
      if ((isManager || isCashier) && user?.branchId) {
        setLoadingBranch(true);
        try {
          const res = await request(`/branches/${user.branchId}`, "GET");
          setAutoSelectedBranch(res?.data);
          onChange?.(res?.data);
        } finally {
          setLoadingBranch(false);
        }
      }
    };

    loadAssignedBranch();
  }, [isManager, isCashier, user?.branchId]);

  /* ======================================
     Auto Select by Passed branchId
  ====================================== */
  useEffect(() => {
    const loadBranchById = async () => {
      if (branchId && isAdmin) {
        setLoadingBranch(true);
        try {
          const res = await request(`/branches/${branchId}`, "GET");
          setAutoSelectedBranch(res?.data);
          onChange?.(res?.data);
        } finally {
          setLoadingBranch(false);
        }
      }
    };

    loadBranchById();
  }, [branchId]);

  const isLocked =
    disabled ||
    isManager ||
    isCashier ||
    (!!branchId && isAdmin);

  return (
    <ReportSmartSelect
      route="/branches"
      value={autoSelectedBranch || value}
      onChange={onChange}
      displayField={["code", "name"]}
      placeholder="Select branch"
      disabled={isLocked}
      className="w-full"
    />
  );
}

import { useSearchParams } from "react-router-dom";

import Page from "../../components/common/Page";
import DataTable from "../../components/table/DataTable";
import useTableManager from "../../hooks/useTableManager";
import Select from "../../components/ui/Select";
import { ATT_TABLE_TOOLBAR } from "../../config/tableToolbarConfig";
import useModalManager from "../../hooks/useModalManager";

import AttendanceCreateModal from "./AttendancePunchModal";

const AttendancePage = () => {
  const [searchParams] = useSearchParams();
  const { modals, openModal, closeModal } = useModalManager();

  const view = searchParams.get("view");
  const table = useTableManager(`/attendance`);
console.log(table)
  const summaryColumns = [
    { key: "employee.code", label: "Emp Code" },
    { key: "employee.name", label: "Employee Name" },
    { key: "employee.designation", label: "Designation" },
    { key: "branch.name", label: "Branch" },
    { key: "totalDays", label: "Total Days", align: "center" },
    {
      key: "presentDays",
      label: "Present",
      align: "center",
      render: (r) => <span className="status approved">{r.presentDays}</span>,
    },
    {
      key: "lateDays",
      label: "Late",
      align: "center",
      render: (r) =>
        r.lateDays > 0 ? (
          <span className="status pending">{r.lateDays}</span>
        ) : (
          "0"
        ),
    },
    {
      key: "absentDays",
      label: "Absent",
      align: "center",
      render: (r) =>
        r.absentDays > 0 ? (
          <span className="status rejected">{r.absentDays}</span>
        ) : (
          "0"
        ),
    },
  {
      key: "workingMinutes",
      label: "Working Time",
      align: "center",
  }
  ];

  const detailsColumns = [
    {
      key: "date",
      label: "Date",
    },
    { key: "employeeCode", label: "Emp Code" },
    { key: "employeeName", label: "Employee Name" },
    { key: "branchName", label: "Branch" },
    {
      key: "punchIn",
      label: "Punch In",
    },
    {
      key: "punchOut",
      label: "Punch Out",
    },
    {
      key: "lateMinutes",
      label: "Late (min)",
      align: "center",
    },
    {
      key: "workingMinutes",
      label: "Working minutes",
      align: "center",
    },
    {
      key: "workingTime",
      label: "Working Time",
      align: "center",
    },
    {
      key: "status",
      label: "Status",
    },
  ];

  return (
    <Page
      title="Attendance"
      subTitle="Employee attendance summary and daily details">

      {modals.punch?.isOpen && (
        <AttendanceCreateModal
          isOpen={modals.punch.isOpen}
          type={modals.punch.type} 
          row={modals.punch.row || null}
          onClose={() => closeModal("punch")}
          onSuccess={table.refetch}
        />
      )}

      <DataTable
        table={table}
        config={ATT_TABLE_TOOLBAR}
        title={view === "summary" ? "Attendance Summary" : "Attendance Details"}
        headerActions={[
          {
            variant: "gradient",
            label: "Punch In",
            onClick: () => openModal("punch", { type: "IN" }),
          },
          {
            variant: "danger",
            label: "Punch Out",
            onClick: () => openModal("punch", { type: "OUT" }),
          },
        ]}
        columns={view === "summary" ? summaryColumns : detailsColumns}
      />
    </Page>
  );
};

export default AttendancePage;

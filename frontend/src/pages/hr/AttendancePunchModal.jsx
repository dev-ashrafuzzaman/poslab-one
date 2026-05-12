import { useForm, Controller, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";

import useApi from "../../hooks/useApi";
import Modal from "../../components/modals/Modal";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import AsyncSelect from "../../components/ui/AsyncSelect";
import { useAuth } from "../../context/useAuth";

export default function AttendancePunchModal({
  isOpen,
  onClose,
  onSuccess,
  type = "IN", // UI hint only
}) {
  const { request, loading } = useApi();
  const { user } = useAuth();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeId: "",
      confirm: false,
    },
  });

  /* 👀 Watchers */
  const employeeId = useWatch({ control, name: "employeeId" });
  const confirmed = useWatch({ control, name: "confirm" });

  /* -------------------------------
     Load employees (active)
  -------------------------------- */
  const loadEmployees = async (search) => {
    const res = await request(
      `/employees?branchId=${user?.branchId}`,
      "GET",
      { search, status: "active", limit: 20 },
      { useToast: false },
    );

    return res?.data?.map((e) => ({
      label: `${e.name} (${e.code})`,
      value: e._id,
    }));
  };

  /* -------------------------------
     Submit
  -------------------------------- */
  const onSubmit = async (data) => {
    await request(
      "/attendance/today",
      "POST",
      {
        employeeId: data.employeeId,
      },
      {
        successMessage:
          type === "IN" ? "Punch in successful" : "Punch out successful",
        onSuccess: () => {
          reset();
          onClose();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={onClose}
      title={type === "IN" ? "Employee Punch In" : "Employee Punch Out"}
      subTitle="Attendance will be recorded automatically for today."
      size="md"
      closeOnOverlayClick
      closeOnEsc
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!confirmed || loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            variant="gradient"
          >
            Record
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* 👤 Employee */}
        <Controller
          name="employeeId"
          control={control}
          rules={{ required: "Employee is required" }}
          render={({ field }) => (
            <AsyncSelect
              label="Employee"
              placeholder="Search employee..."
              loadOptions={loadEmployees}
              value={field.value}
              onChange={field.onChange}
              error={errors.employeeId?.message}
            />
          )}
        />

        {/* ✅ Confirm */}
        <Controller
          name="confirm"
          control={control}
          render={({ field }) => (
            <Checkbox
              disabled={!employeeId}
              checked={field.value}
              onChange={field.onChange}
              label="I confirm the attendance information is correct"
            />
          )}
        />

        {/* ℹ️ Info */}
        <div className="text-xs text-muted">
          • If no attendance exists today → Punch In will be recorded • If Punch
          In already exists → Punch Out will be recorded
        </div>
      </div>
    </Modal>
  );
}

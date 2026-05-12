import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Checkbox from "../../../components/ui/Checkbox";
import SmartSelect from "../../../components/common/SmartSelect";

export default function UserCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employee: null,
      role: null,
      branch: null,
      password: "",
      confirmPassword: "",
    },
  });

  const isSuperAdmin = watch("isSuperAdmin");
  const password = watch("password");

  /* 🔄 HARD RESET on modal open */
  useEffect(() => {
    if (isOpen) {
      reset({
        employee: null,
        role: null,
        branch: null,
        password: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    const payload = {
      password: data.password,
    };

    if (!data.isSuperAdmin) {
      payload.employeeId = data.employee?._id;
      payload.roleId = data.role?._id;
      payload.branchId = data.branch?._id || null;
    }

    await request("/users", "POST", payload, {
      successMessage: "User created successfully",
      onSuccess: () => {
        setIsOpen(false);
        refetch();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Create System User"
      subTitle="Assign login access with role & permissions"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            variant="gradient"
          >
            Create User
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 👤 Employee */}
        {!isSuperAdmin && (
          <Controller
            name="employee"
            control={control}
            rules={{ required: "Employee is required" }}
            render={({ field }) => (
              <SmartSelect
                key={`emp-${isOpen}`}
                label="Employee"
                customRoute="/employees"
                displayField={["role", "code", "name"]}
                idField="_id"
                preLoad={true}
                placeholder="Search employee"
                value={field.value}
                onChange={(opt) => field.onChange(opt?.raw || null)}
                error={errors.employee?.message}
              />
            )}
          />
        )}

        {/* 🎭 Role */}
        {!isSuperAdmin && (
          <Controller
            name="role"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <SmartSelect
                key={`role-${isOpen}`}
                label="Role"
                preLoad={true}
                customRoute="/roles"
                displayField={["name"]}
                idField="_id"
                placeholder="Select role"
                value={field.value}
                onChange={(opt) => field.onChange(opt?.raw || null)}
                error={errors.role?.message}
              />
            )}
          />
        )}

        {/* 🏢 Branch */}
        {!isSuperAdmin && (
          <Controller
            name="branch"
            control={control}
            render={({ field }) => (
              <SmartSelect
                key={`branch-${isOpen}`}
                label="Branch"
                preLoad={true}
                customRoute="/branches"
                displayField={["code", "name"]}
                idField="_id"
                placeholder="Select branch (optional)"
                value={field.value}
                onChange={(opt) => field.onChange(opt?.raw || null)}
              />
            )}
          />
        )}

        {/* 🔑 Password */}
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            label="Password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Min 6 characters" },
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* 🔁 Confirm Password */}
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            label="Confirm Password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Confirm password",
              validate: (v) => v === password || "Passwords do not match",
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </Modal>
  );
}

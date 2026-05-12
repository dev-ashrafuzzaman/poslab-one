import { useForm, Controller } from "react-hook-form";
import {
  Loader2,
  User,
  Phone,
  Briefcase,
  CreditCard,
  Building,
} from "lucide-react";

import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import AsyncSelect from "../../../components/ui/AsyncSelect";
import { toast } from "sonner";

export default function EmployeeCreateModal({ isOpen, setIsOpen, refetch }) {
  const { request, loading } = useApi();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      fatherName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      role: "",
      designation: "",
      joiningDate: "",
      branchId: null,
      payroll: {
        salaryType: "monthly",
        baseSalary: "",
        commissionType: "",
        commissionValue: "",
      },
    },
  });

  /* ================= LOAD BRANCHES ================= */
  const loadBranches = async (search) => {
    const res = await request(
      "/branches",
      "GET",
      { search, limit: 10, status: "active" },
      { useToast: false },
    );

    return res?.data?.map((b) => ({
      label: `${b.name} (${b.code})`,
      value: b._id,
    }));
  };

  /* ================= FORM SUBMIT ================= */
  const commissionType = watch("payroll.commissionType");

  const onSubmit = async (data) => {

    if (data.payroll.commissionType && !data.payroll.commissionValue) {
      return toast.error("Commission value is required");
    }
console.log("emp",data)
   const res = await request("/employees", "POST", data, {
      successMessage: "Employee created successfully",
      onSuccess: () => {
        reset();
        setIsOpen(false);
        refetch?.();
      },
    });
 console.log("resp",res)
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add New Employee"
      subTitle="Create employee with personal, employment and payroll details."
      size="6xl"
      closeOnOverlayClick
      closeOnEsc
      footer={
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 px-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="px-6 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
            variant="gradient"
            className="px-8 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
          >
            Create Employee
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-1">
        {/* ================= PERSONAL INFO ================= */}
        <section className="rounded-2xl border border-gray-100 bg-linear-to-br from-white to-blue-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Personal Information
              </h3>
              <p className="text-sm text-gray-500">Basic personal details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Employee Name"
              error={errors?.name?.message}
              {...register("name", {
                required: "Name is required",
              })}
              className="bg-white focus:bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <Input
              label="Father Name"
              {...register("fatherName")}
              className="bg-white focus:bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <Input
              label="Date of Birth"
              type="date"
              {...register("dob")}
              className="bg-white focus:bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="" className="text-gray-400">
                  Select Gender
                </option>
                <option value="male" className="text-gray-800">
                  Male
                </option>
                <option value="female" className="text-gray-800">
                  Female
                </option>
                <option value="other" className="text-gray-800">
                  Other
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* ================= CONTACT INFO ================= */}
        <section className="rounded-2xl border border-gray-100 bg-linear-to-br from-white to-emerald-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Contact Information
              </h3>
              <p className="text-sm text-gray-500">Communication details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Phone"
              placeholder="017XXXXXXXX"
              error={errors.contact?.phone?.message}
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^(01)[0-9]{9}$/,
                  message: "Invalid BD phone number",
                },
              })}
              className="bg-white focus:bg-white border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />

            <Input
              label="Email"
              type="email"
              {...register("email")}
              className="bg-white focus:bg-white border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />

            <div className="md:col-span-2">
              <Input
                label="Address"
                {...register("address")}
                className="bg-white focus:bg-white border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </section>

        {/* ================= EMPLOYMENT ================= */}
        <section className="rounded-2xl border border-gray-100 bg-linear-to-br from-white to-purple-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Employment Details
              </h3>
              <p className="text-sm text-gray-500">
                Job and workplace information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register("role", {
                  required: "Role is required",
                })}
                className="w-full px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              >
                <option value="" className="text-gray-400">
                  Select Role
                </option>
                <option value="Admin" className="text-gray-800">
                  Admin
                </option>
                <option value="Manager" className="text-gray-800">
                  Manager
                </option>
                <option value="Cashier" className="text-gray-800">
                  Cashier
                </option>
                <option value="Salesman" className="text-gray-800">
                  Sales Man
                </option>
              </select>
              {errors?.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            <Input
              label="Designation"
              error={errors?.designation?.message}
              {...register("designation", {
                required: "Designation is required",
              })}
              className="bg-white focus:bg-white border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />

            <Input
              label="Joining Date"
              type="date"
              {...register("joiningDate")}
              className="bg-white focus:bg-white border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />

            <Controller
              name="branchId"
              control={control}
              rules={{ required: "Branch is required" }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <AsyncSelect
                    placeholder="Search branch..."
                    loadOptions={loadBranches}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors?.branchId?.message}
                    className="border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              )}
            />
          </div>
        </section>

        {/* ================= PAYROLL ================= */}
        <section className="rounded-2xl border border-gray-100 bg-linear-to-br from-white to-amber-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Payroll</h3>
              <p className="text-sm text-gray-500">
                Salary and compensation details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Salary Type
              </label>
              <select
                {...register("payroll.salaryType")}
                className="w-full px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
              >
                <option value="monthly" className="text-gray-800">
                  Monthly
                </option>
                <option value="daily" className="text-gray-800">
                  Daily
                </option>
              </select>
            </div>

            <Input
              label="Base Salary"
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              error={errors.payroll?.baseSalary?.message}
              {...register("payroll.baseSalary", {
                required: "Base salary is required",
                min: { value: 0, message: "Salary cannot be negative" },
              })}
              className="bg-white focus:bg-white border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Commission Type
              </label>
              <select
                {...register("payroll.commissionType")}
                className="w-full px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
              >
                <option value="" className="text-gray-400">
                  No Commission
                </option>
                <option value="percentage" className="text-gray-800">
                  Percentage
                </option>
                <option value="fixed" className="text-gray-800">
                  Fixed
                </option>
              </select>
            </div>

            <Input
              label="Commission Value"
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              disabled={!commissionType}
              {...register("payroll.commissionValue")}
              className={`bg-white border-gray-200 focus:ring-2 outline-none transition-all ${
                !commissionType
                  ? "bg-gray-50 text-gray-400 border-gray-200"
                  : "focus:border-amber-400 focus:ring-amber-100"
              }`}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}

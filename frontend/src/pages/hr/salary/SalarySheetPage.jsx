import { useEffect, useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useAuth } from "../../../context/useAuth";
import Page from "../../../components/common/Page";
import Button from "../../../components/ui/Button";
import ReportSmartSelect from "../../../components/common/ReportSmartSelect";
import {
  Calendar,
  Users,
  DollarSign,
  Percent,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SalarySheetPage() {
  const { axiosSecure } = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();
  /* =====================================================
     FORM
  ===================================================== */

  const { register, handleSubmit, watch, control, setValue } = useForm({
    defaultValues: {
      branchId: "",
      month: "",
    },
  });

  const branchValue = watch("branchId");
  const month = watch("month");

  /* =====================================================
     STATE
  ===================================================== */

  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [empLoading, setEmpLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  /* =====================================================
     NORMALIZE BRANCH ID
     (Object or String → Always String)
  ===================================================== */

  const resolvedBranchId =
    typeof branchValue === "string" ? branchValue : branchValue?._id;

  const isBranchFixed = !!user?.branchId;

  /* =====================================================
     AUTO SET BRANCH (Manager)
  ===================================================== */

  useEffect(() => {
    if (isBranchFixed) {
      setValue("branchId", user.branchId);
    }
  }, [isBranchFixed, setValue, user]);

  /* =====================================================
     HANDLE CHECKBOX
  ===================================================== */

  const toggleSelect = (emp) => {
    setSelected((prev) => {
      if (prev[emp._id]) {
        const copy = { ...prev };
        delete copy[emp._id];
        return copy;
      }

      return {
        ...prev,
        [emp._id]: {
          employeeId: emp._id,
          bonus: 0,
          deduction: 0,
        },
      };
    });
  };

  /* =====================================================
     UPDATE BONUS / DEDUCTION
  ===================================================== */

  const updateField = (id, field, value) => {
    setSelected((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Number(value),
      },
    }));
  };

  /* =====================================================
     TOTAL CALCULATION
  ===================================================== */

  const totalNet = useMemo(() => {
    return employees.reduce((sum, emp) => {
      if (!selected[emp._id]) return sum;

      const base = emp.payroll?.baseSalary || 0;
      const commission = emp.commission?.net || 0;
      const bonus = selected[emp._id]?.bonus || 0;
      const deduction = selected[emp._id]?.deduction || 0;

      return sum + (base + commission + bonus - deduction);
    }, 0);
  }, [selected, employees]);

  const selectedCount = Object.keys(selected).length;

  const handleGenerateEmployees = async () => {
    if (!resolvedBranchId) {
      toast.error("Select branch");
      return;
    }

    if (!month) {
      toast.error("Select month");
      return;
    }

    try {
      setEmpLoading(true);
      setHasGenerated(false);
      setEmployees([]);
      setSelected({});

      const res = await axiosSecure.get("/payroll/employees-with-commission", {
        params: {
          branchId: resolvedBranchId,
          month,
        },
      });
      console.log("res", res);
      setEmployees(res.data?.data || []);
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setEmpLoading(false);
    }
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const onSubmit = async () => {
    if (!resolvedBranchId) {
      toast.error("Select branch");
      return;
    }

    if (!month) {
      toast.error("Select month");
      return;
    }

    const selectedEmployees = Object.values(selected);

    if (selectedEmployees.length === 0) {
      toast.error("Select at least one employee");
      return;
    }

    try {
      setLoading(true);

      await axiosSecure.post("/payroll/salary-sheets", {
        branchId: resolvedBranchId,
        month,
        employees: selectedEmployees,
      });

      toast.success("Salary sheet created successfully");
      setSelected({});
      navigate("/hr/payroll/salary-sheet");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <Page title="Salary Sheet" subTitle="Generate monthly salary sheet">
      <div className="space-y-6">
        {/* Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl shadow-sm shadow-blue-200">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Active Employees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-sm shadow-emerald-200">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-medium">Selected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-xl shadow-sm shadow-purple-200">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Net</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalNet.toLocaleString()} BDT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {!isBranchFixed && (
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Select Branch
                </label>
                <Controller
                  name="branchId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <ReportSmartSelect
                      route="/branches"
                      displayField={["name", "code"]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose branch..."
                      className="w-full"
                    />
                  )}
                />
              </div>
            )}

            <div className={!isBranchFixed ? "flex-1" : "w-full md:w-96"}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Select Month
                </span>
              </label>
              <div className="relative">
                <input
                  type="month"
                  {...register("month")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm 
                           focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                           transition-all duration-200 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleGenerateEmployees}
                disabled={empLoading}
                variant="gradient"
              >
                {empLoading ? "Loading..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>

        {/* Employee Table Section */}
        {hasGenerated && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-linear-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">Select</div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Commission Earn
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Bonus
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Deduction
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Net
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp, index) => {
                    const isChecked = !!selected[emp._id];
                    const base = emp.payroll?.baseSalary || 0;
                    const commission = emp.commission?.net || 0;
                    const bonus = selected[emp._id]?.bonus || 0;
                    const deduction = selected[emp._id]?.deduction || 0;
                    const net = base + commission + bonus - deduction;
                    return (
                      <tr
                        key={emp._id}
                        className={`group transition-all duration-150 hover:bg-blue-50/30
                          ${isChecked ? "bg-blue-50/50" : ""}
                          ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                      >
                        <td className="px-6 py-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelect(emp)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 
                                       focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0
                                       transition-all duration-200"
                            />
                          </label>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 
                                          flex items-center justify-center text-white text-sm font-medium"
                            >
                              {emp.name?.charAt(0) || "E"}
                            </div>
                            <span className="font-medium text-gray-900">
                              {emp.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {emp.role}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {base.toLocaleString()} BDT
                        </td>

                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {commission.toLocaleString()} BDT
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isChecked ? (
                            <div className="relative inline-block">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-xs">+</span>
                              </div>
                              <input
                                type="number"
                                onWheel={(e) => e.currentTarget.blur()}
                                value={bonus}
                                onChange={(e) =>
                                  updateField(emp._id, "bonus", e.target.value)
                                }
                                className="w-28 px-3 pl-6 py-1.5 text-right bg-white border border-gray-200 
                                         rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 
                                         focus:border-emerald-500 transition-all duration-200"
                                placeholder="0"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isChecked ? (
                            <div className="relative inline-block">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-xs">-</span>
                              </div>
                              <input
                                type="number"
                                onWheel={(e) => e.currentTarget.blur()}
                                value={deduction}
                                onChange={(e) =>
                                  updateField(
                                    emp._id,
                                    "deduction",
                                    e.target.value,
                                  )
                                }
                                className="w-28 px-3 pl-6 py-1.5 text-right bg-white border border-gray-200 
                                         rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 
                                         focus:border-rose-500 transition-all duration-200"
                                placeholder="0"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isChecked ? (
                            <span className="font-semibold text-gray-900">
                              {net.toLocaleString()} BDT
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {employees.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  No active employees found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Select a branch to view employees
                </p>
              </div>
            )}

            {/* Footer Summary */}
            {employees.length > 0 && (
              <div className="border-t border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-sm text-gray-600">
                        Selected Employees
                      </span>
                      <span className="ml-2 text-lg font-bold text-gray-900">
                        {selectedCount}
                      </span>
                    </div>
                    {selectedCount > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">
                          Average Net
                        </span>
                        <span className="ml-2 text-lg font-bold text-gray-900">
                          {selectedCount > 0
                            ? (totalNet / selectedCount).toLocaleString()
                            : 0}{" "}
                          BDT
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm text-gray-600 block">
                        Total Payable
                      </span>
                      <span
                        className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 
                                   bg-clip-text text-transparent"
                      >
                        {totalNet.toLocaleString()} BDT
                      </span>
                    </div>

                    <Button
                      variant="gradient"
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                      className="min-w-45 shadow-lg shadow-blue-500/20"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {/* <DollarSign className="w-4 h-4" /> */}
                          Create Salary Sheet
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

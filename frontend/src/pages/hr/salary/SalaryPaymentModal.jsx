import { useEffect, useState } from "react";
import { Loader2, CheckCircle, User, CreditCard, Calendar, Briefcase, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Controller, useForm } from "react-hook-form";
import ReportSmartSelect from "../../../components/common/ReportSmartSelect";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

export default function SalaryPaymentModal({
  isOpen,
  setIsOpen,
  item,
  onSuccess, 
}) {
  const { axiosSecure } = useAxiosSecure();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }, 
  } = useForm({
    defaultValues: {
      amount: item?.payableRemaining || 0,
      paymentAccountId: null,
    },
  });
console.log(item)
  const [loading, setLoading] = useState(false);

  const amount = watch("amount");
  const paymentAccount = watch("paymentAccountId");

  /* ===============================
     AUTO SET DEFAULT AMOUNT
  =============================== */

  useEffect(() => {
    if (item) {
      setValue("amount", item.payableRemaining);
    }
  }, [item, setValue]);

  /* ===============================
     VALIDATION
  =============================== */

  const isValid =
    amount > 0 &&
    amount <= item?.payableRemaining &&
    paymentAccount;

  /* ===============================
     SUBMIT
  =============================== */

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await axiosSecure.post("/payroll/pay-salary", {
        salarySheetItemId: item._id,
        amount: Number(data.amount),
        paymentAccountId: data.paymentAccountId._id,
        payment: data.paymentAccountId.name,
      });

      toast.success("Salary paid successfully", {
        description: `${item.employee?.name} has been paid ${Number(data.amount).toLocaleString()}`,
        icon: <CheckCircle className="h-4 w-4" />,
      });

      onSuccess?.();
      setIsOpen(false);
    } catch (err) {
      toast.error("Payment failed", {
        description: err.response?.data?.message || "An error occurred while processing payment",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Process Salary Payment"
      subTitle="Review employee details and confirm payment"
      size="3xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
            prefix={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )
            }
            variant="gradient"
            className="px-6 min-w-35"
          >
            {loading ? "Processing..." : "Pay Salary"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Employee Summary Card */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-lg shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.employee?.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {item.employee?.designation} • {item.employee?.role}
                </p>
              </div>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-full text-sm font-medium text-blue-700 shadow-sm border border-blue-200">
              ID: {item.employee?.code}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Employee Details */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Employment Details
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <DetailRow 
                label="Request Date" 
                value={new Date(item.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              />
              <DetailRow 
                label="Department" 
                value={item.employee?.department || 'Not specified'} 
              />
              <DetailRow 
                label="Employee Type" 
                value={item.employee?.employmentType || 'Permanent'} 
                badge
              />
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Salary Breakdown
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <DetailRow label="Base Salary" value={formatCurrency(item.baseSalary)} />
              <DetailRow label="Commission Earn" value={formatCurrency(item.commissionEarned)} className="text-green-600" />
              <DetailRow label="Bonus" value={formatCurrency(item.bonus)} className="text-green-600" />
              <DetailRow label="Deduction" value={formatCurrency(item.deduction)} className="text-red-600" />
              <div className="border-t border-gray-200 my-2 pt-2">
                <DetailRow 
                  label="Net Salary" 
                  value={formatCurrency(item.netSalary)} 
                  className="font-semibold text-gray-900"
                />
                <DetailRow 
                  label="Remaining Balance" 
                  value={formatCurrency(item.payableRemaining)} 
                  className="font-semibold text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            Payment Details
          </h3>
          
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium"></span>
                  <input
                    type="number"
                    value={amount || ""}
                    onChange={(e) => setValue("amount", Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="Enter amount"
                    min="0"
                    max={item.payableRemaining}
                    step="0.01"
                  />
                </div>
                {amount > item.payableRemaining && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Amount exceeds remaining balance
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Account <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="paymentAccountId"
                  control={control}
                  render={({ field }) => (
                    <ReportSmartSelect
                      route="/sales/payment-methods"
                      extraParams={{
                        parentCode: "1002",
                        sort: "cash_first",
                      }}
                      displayField={["name", "code"]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select payment account"
                      className="w-full"
                    />
                  )}
                />
                {!paymentAccount && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Payment account is required
                  </p>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            {isValid && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Ready to process payment of {formatCurrency(amount)} to {item.employee?.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <p>This transaction will be recorded and cannot be undone. Please verify all details before confirming.</p>
        </div>
      </div>
    </Modal>
  );
}

// Helper component for detail rows
function DetailRow({ label, value, className = "", badge = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      {badge ? (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          {value}
        </span>
      ) : (
        <span className={`text-sm text-gray-900 ${className}`}>{value}</span>
      )}
    </div>
  );
}
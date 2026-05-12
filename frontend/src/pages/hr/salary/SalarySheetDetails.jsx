import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../../../components/common/Page";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SalaryPaymentModal from "./SalaryPaymentModal";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";
import useModalManager from "../../../hooks/useModalManager";
import {
  Building2,
  UserCircle,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
  Wallet,
  TrendingUp,
  Download,
  Printer,
  Send,
  ChevronRight,
} from "lucide-react";

export default function SalarySheetDetails() {
  const { id } = useParams();
  const { axiosSecure } = useAxiosSecure();
  const { modals, openModal, closeModal } = useModalManager();

  const [sheet, setSheet] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ==============================
     FETCH DETAILS
  ============================== */

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get(`/payroll/salary-sheets/${id}`);
      console.log(res)
      setSheet(res.data.data);
    } catch {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  /* ==============================
     HANDLE OPEN PAYMENT MODAL
  ============================== */

  const handleOpenPayment = (item) => {
    setSelectedItem(item);
    openModal("salaryPayment");
  };

  /* ==============================
     STATUS STYLES
  ============================== */

  const getStatusStyles = (status) => {
    switch (status) {
      case "POSTED":
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DRAFT":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getItemStatusIcon = (status) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  /* ==============================
     LOADING / EMPTY
  ============================== */

  if (loading) {
    return (
      <Page title="Salary Sheet Details">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading salary sheet details...
          </p>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </div>
      </Page>
    );
  }

  if (!sheet) return null;

  return (
    <Page title={"Salary Sheet"}>
      <div className="bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Salary Sheet
            </span>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-gray-900">{sheet.month}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
            Voucher: {sheet.journal?.voucherNo || "Not Generated"}
          </span>
        </div>
      </div>
      <div className="space-y-6">
        {/* ================= HEADER SECTION ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Background */}
          <div className="h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Branch Info */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="p-3 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Branch
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {sheet.branch?.name}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      {sheet.branch?.address}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      {sheet.branch?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Created By */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <UserCircle className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Created By
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {sheet.createdByUser?.name}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      {sheet.createdByUser?.email}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sheet.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div
                    className={`p-3 rounded-xl border ${
                      sheet.status === "POSTED"
                        ? "bg-amber-50 border-amber-100"
                        : " bg-emerald-50 border-emerald-100"
                    }`}
                  >
                    {sheet.status === "POSTED" ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Sheet Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusStyles(sheet.status)}`}
                    >
                      {sheet.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Month:{" "}
                      <span className="font-semibold text-gray-900">
                        {sheet.month}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            icon={<DollarSign className="w-5 h-5 text-blue-600" />}
            iconBg="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
            label="Total Net Salary"
            value={` ${sheet.totalNet?.toLocaleString() || 0}`}
            trend="Total payable amount"
            trendIcon={<TrendingUp className="w-3 h-3" />}
          />

          <SummaryCard
            icon={<Users className="w-5 h-5 text-purple-600" />}
            iconBg="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
            label="Total Employees"
            value={sheet.totalEmployees || 0}
            trend="Active employees"
          />

          <SummaryCard
            icon={<Wallet className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
            label="Total Paid"
            value={` ${sheet.totalPaid?.toLocaleString() || 0}`}
            valueClass="text-emerald-600"
            progress={
              sheet.totalPaid && sheet.totalNet
                ? Math.round((sheet.totalPaid / sheet.totalNet) * 100)
                : 0
            }
          />

          <SummaryCard
            icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
            iconBg="bg-gradient-to-br from-rose-50 to-red-50 border-rose-100"
            label="Remaining"
            value={` ${sheet.totalRemaining?.toLocaleString() || 0}`}
            valueClass="text-rose-600"
            trend={`${sheet.items?.filter((i) => i.status !== "PAID").length || 0} pending payments`}
          />
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 hover:bg-gray-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* ================= EMPLOYEE TABLE ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Employee Salary Details
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sheet.items?.length || 0} employees ·{" "}
                    {sheet.items?.filter((i) => i.status === "PAID").length ||
                      0}{" "}
                    paid
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sorted by name</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee Details
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sheet.items.map((item, index) => {
                  const isPaid = item.status === "PAID";

                  return (
                    <tr
                      key={item._id}
                      className={`group hover:bg-blue-50/30 transition-all duration-150
                        ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                        ${isPaid ? "opacity-75" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center
                              ${
                                isPaid
                                  ? "bg-linear-to-br from-emerald-500 to-teal-600"
                                  : "bg-linear-to-br from-blue-500 to-indigo-600"
                              }`}
                            >
                              <span className="text-white text-sm font-medium">
                                {item.employee?.name?.charAt(0) || "E"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {item.employee?.name}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
                                {item.employee?.code}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {item.employee?.designation}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-xs text-gray-500">
                                {item.employee?.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                           {item.netSalary?.toLocaleString() || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {item.payableRemaining > 0 ? (
                          <span className="font-semibold text-rose-600">
                             {item.payableRemaining?.toLocaleString() || 0}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">
                             0
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
                            ${
                              item.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {getItemStatusIcon(item.status)}
                            {item.status}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {!isPaid ? (
                          <Button
                            size="sm"
                            onClick={() => handleOpenPayment(item)}
                            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 
                                     hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 
                                     hover:shadow-lg transition-all duration-200"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Process Payment
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">
                  <span className="font-medium">
                    {sheet.items?.length || 0}
                  </span>{" "}
                  total employees
                </span>
                <span className="text-xs text-gray-600">
                  <span className="font-medium">
                    {sheet.items?.filter((i) => i.status === "PAID").length ||
                      0}
                  </span>{" "}
                  paid
                </span>
                <span className="text-xs text-gray-600">
                  <span className="font-medium">
                    {sheet.items?.filter((i) => i.status !== "PAID").length ||
                      0}
                  </span>{" "}
                  pending
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Page 1 of 1</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================= PAYMENT MODAL ================= */}
      {modals.salaryPayment?.isOpen && selectedItem && (
        <SalaryPaymentModal
          isOpen={modals.salaryPayment.isOpen}
          setIsOpen={() => closeModal("salaryPayment")}
          item={selectedItem}
          onSuccess={fetchDetails}
        />
      )}
    </Page>
  );
}

/* ==============================
   Enhanced Summary Card
============================== */

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  valueClass = "text-gray-900",
  trend,
  trendIcon,
  progress,
}) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div
          className={`p-3 rounded-xl border ${iconBg} group-hover:scale-110 transition-transform duration-200`}
        >
          {icon}
        </div>

        {progress !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-emerald-600">
              {progress}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p
          className={`text-2xl font-bold ${valueClass} group-hover:scale-105 transition-transform origin-left duration-200`}
        >
          {value}
        </p>

        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trendIcon && <span className="text-gray-400">{trendIcon}</span>}
            <p className="text-xs text-gray-500">{trend}</p>
          </div>
        )}
      </div>
    </div>
  );
}

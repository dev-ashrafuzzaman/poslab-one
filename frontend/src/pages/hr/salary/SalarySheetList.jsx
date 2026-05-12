import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Page from "../../../components/common/Page";
import Button from "../../../components/ui/Button";
import { toast } from "sonner";
import { 
  CalendarIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon 
} from "@heroicons/react/24/outline";

export default function SalarySheetList() {
  const { axiosSecure } = useAxiosSecure();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get("/payroll/salary-sheets");
      console.log(res)
      setRows(res.data.data || []);
    } catch {
      toast.error("Failed to load salary sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <Page
      title="Salary Sheets"
      subTitle="View and manage all generated salary sheets"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Salary Sheets Overview</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {rows.length} {rows.length === 1 ? 'sheet' : 'sheets'} generated
                </p>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Total Net</p>
                <p className="text-lg font-semibold text-green-700">
                  {formatCurrency(rows.reduce((sum, r) => sum + (r.totalNet || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Month
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Net
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr 
                    key={r._id} 
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors duration-150">
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {r.month || 'N/A'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-green-50 rounded-md group-hover:bg-green-100 transition-colors duration-150">
                          <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {formatCurrency(r.totalNet)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(r.status)}
                        <span className={`ml-2 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(r.status)}`}>
                          {r.status || 'Pending'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/hr/payroll/salary-sheet/${r._id}`}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 shadow-sm"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm text-gray-500">Loading salary sheets...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="p-3 bg-gray-100 rounded-full">
                          <CalendarIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-gray-900">No salary sheets found</p>
                        <p className="mt-1 text-sm text-gray-500">Generate your first salary sheet to get started</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        {rows.length > 0 && !loading && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
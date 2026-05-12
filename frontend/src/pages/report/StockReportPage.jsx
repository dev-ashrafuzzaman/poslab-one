import { useForm, Controller, useWatch } from "react-hook-form";
import { useMemo, useState, useEffect } from "react";
import Page from "../../components/common/Page";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import ReportSmartSelect from "../../components/common/ReportSmartSelect";
import { printStockReport } from "./printStockReport";
import { useAuth } from "../../context/useAuth";
import {
  BarChart3,
  Filter,
  RefreshCw,
  Printer,
  Package,
  TrendingUp,
  Layers,
  Grid,
  Hash,
  Palette,
  Ruler,
  DollarSign,
  Percent,
} from "lucide-react";
import BranchSmartSelect from "../../components/common/BranchSmartSelect";

export default function StockReportPage() {
  const { axiosSecure } = useAxiosSecure();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);

  /* =====================================================
     GET USER ROLE
  ===================================================== */
  useEffect(() => {
    const role = user?.roleName
    setUserRole(role);
  }, [user]);

  /* =====================================================
     FORM
  ===================================================== */
  const { control, reset, setValue } = useForm({
    defaultValues: {
      groupBy: "variant",
      branch: null,
      mainCategory: null,
      subCategory: null,
      productType: null,
      product: null,
      variant: null,
    },
  });

  /* =====================================================
     WATCHERS (LEVEL DEPENDENCY)
  ===================================================== */
  const branch = useWatch({ control, name: "branch" });
  const mainCategory = useWatch({ control, name: "mainCategory" });
  const product = useWatch({ control, name: "product" });
  const filters = useWatch({ control });

  /* =====================================================
     STATE
  ===================================================== */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState(null);

  // Check if user can select branch
  const canSelectBranch = userRole == 'Super Admin' || userRole == 'Admin';

  // Set default branch for non-admin users
  useEffect(() => {
    if (!canSelectBranch && user?.branchId && !branch) {
      // You might need to fetch branch details using branchId
      // For now, we'll set a placeholder or you can fetch branch details
      setValue('branch', { _id: user.branchId, name: user?.branchName || 'Your Branch' });
    }
  }, [canSelectBranch, user, branch, setValue]);

  /* =====================================================
     STATISTICS
  ===================================================== */
  const stats = useMemo(() => {
    if (!generated || rows.length === 0) return null;

    const totals = rows.reduce(
      (acc, row) => ({
        qty: acc.qty + (row.totalQty || 0),
        cost: acc.cost + (row.totalCost || 0),
        sale: acc.sale + (row.totalSale || 0),
        margin: acc.margin + (row.totalMargin || 0),
      }),
      { qty: 0, cost: 0, sale: 0, margin: 0 },
    );

    const avgMargin = totals.sale > 0 ? (totals.margin / totals.sale) * 100 : 0;

    return {
      ...totals,
      avgMargin,
      items: rows.length,
    };
  }, [rows, generated]);

  /* =====================================================
     GENERATE REPORT
  ===================================================== */
  const handleGenerate = async () => {
    // Branch validation based on role
    if (canSelectBranch && !branch?._id) {
      setError("Please select a branch");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        // Only include branchId if user can select branch, otherwise use user's branch
        branchId: canSelectBranch ? branch?._id : (user?.branchId || branch?._id),
        groupBy: filters.groupBy,

        categoryMainId: mainCategory?._id || null,
        categorySubId: filters.subCategory?._id || null,
        productTypeId: filters.productType?._id || null,
        productId: product?._id || null,
        variantId: filters.variant?._id || null,

        valuation: "FIFO",
      };

      const res = await axiosSecure.post("/stocks/report", payload);
      console.log("stock report",res)
      setRows(res.data.rows || []);
      setGenerated(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to generate report",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DYNAMIC COLUMNS
  ===================================================== */
  const columns = useMemo(() => {
    if (filters.groupBy === "variant") {
      return [
        { key: "sku", label: "SKU", icon: <Hash className="w-4 h-4" /> },
        { key: "size", label: "Size", icon: <Ruler className="w-4 h-4" /> },
        { key: "color", label: "Color", icon: <Palette className="w-4 h-4" /> },
        {
          key: "totalQty",
          label: "Quantity",
          icon: <Package className="w-4 h-4" />,
        },
        {
          key: "totalCost",
          label: "Cost Value",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          key: "totalSale",
          label: "Sale Value",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          key: "totalMargin",
          label: "Profit Margin",
          icon: <Percent className="w-4 h-4" />,
        },
      ];
    }

    return [
      { key: "name", label: "Group", icon: <Layers className="w-4 h-4" /> },
      {
        key: "totalQty",
        label: "Quantity",
        icon: <Package className="w-4 h-4" />,
      },
      {
        key: "totalCost",
        label: "Cost Value",
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        key: "totalSale",
        label: "Sale Value",
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        key: "totalMargin",
        label: "Margin",
        icon: <Percent className="w-4 h-4" />,
      },
    ];
  }, [filters.groupBy]);

  const handleReset = () => {
    reset({
      groupBy: "variant",
      branch: null,
      mainCategory: null,
      subCategory: null,
      productType: null,
      product: null,
      variant: null,
    });

    setRows([]);
    setGenerated(false);
    setError(null);
  };

  const handlePrint = () => {
    printStockReport({
      title: "Stock Report",
      filters: {
        Branch: branch?.name || (user?.branchId ? user?.branchName : 'N/A'),
        "Main Category": mainCategory?.name,
        "Sub Category": filters.subCategory?.name,
        "Product Type": filters.productType?.name,
        Product: product?.name,
        Variant: filters.variant?.sku,
      },
      columns,
      rows,
    });
  };

  return (
    <Page
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Stock Valuation Report
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Branch, Category, Product & Variant wise stock valuation
            </p>
          </div>
        </div>
      }
    >
      {/* =====================================================
         FILTERS CARD
      ===================================================== */}
      <div className="p-6 ">
        {/* Filter Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Branch - Only for Super Admin and Admin */}
          {canSelectBranch ? (
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <BranchSmartSelect
                    route="/branches"
                    displayField={["code", "name"]}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select branch"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            />
          ) : (
            // Hidden branch field for non-admin users (still shows branch info but disabled)
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                {user?.branchName || 'Your Branch'}
              </div>
              {/* Hidden input to store branch value */}
              <input 
                type="hidden" 
                value={user?.branchId || ''} 
                onChange={() => {}} 
              />
            </div>
          )}

          {/* Group By */}
          <Controller
            name="groupBy"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group By
                </label>
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { label: "Main Category", value: "category_main" },
                    { label: "Sub Category", value: "category_sub" },
                    { label: "Product Type", value: "product_type" },
                    { label: "Product", value: "product" },
                    { label: "Variant (SKU)", value: "variant" },
                  ]}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          />

          {/* Product Type */}
          <Controller
            name="productType"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type
                </label>
                <ReportSmartSelect
                  route="/products/types"
                  displayField={["name"]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select product type"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          />
        </div>

        {/* Filter Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Main Category */}
          <Controller
            name="mainCategory"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Category
                </label>
                <ReportSmartSelect
                  route="/categories"
                  extraParams={{ level: 1 }}
                  displayField={["name"]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select main category"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          />

          {/* Sub Category */}
          <Controller
            name="subCategory"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category
                </label>
                <ReportSmartSelect
                  disabled={!mainCategory}
                  route="/categories"
                  extraParams={{
                    level: 2,
                    parentId: mainCategory?._id,
                  }}
                  displayField={["name"]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={
                    mainCategory
                      ? "Select sub category"
                      : "Select main category first"
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          />
        </div>

        {/* Filter Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Product */}
          <Controller
            name="product"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <ReportSmartSelect
                  route="/products"
                  displayField={["name", "productCode"]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select product"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          />

          {/* Variant */}
          <Controller
            name="variant"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant / SKU
                </label>
                <ReportSmartSelect
                  disabled={!product}
                  route="/variants"
                  extraParams={{ productId: product?._id }}
                  displayField={["sku"]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={
                    product ? "Select variant" : "Select product first"
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          />
        </div>
      </div>
      
      {/* =====================================================
         ACTION BUTTONS
      ===================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="border-gray-300 hover:border-gray-400 text-gray-700"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Reset Filters
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!generated}
            className="border-gray-300 hover:border-gray-400 text-gray-700"
            icon={<Printer className="w-4 h-4" />}
          >
            Print Report
          </Button>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || (canSelectBranch && !branch?._id)}
          className="px-8 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Report...
            </span>
          ) : (
            "Generate Report"
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* =====================================================
         SUMMARY STATISTICS
      ===================================================== */}
      {generated && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-linear-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.items}
                </p>
              </div>
              <Grid className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-linear-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">
                  Total Quantity
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.qty.toLocaleString()}
                </p>
              </div>
              <Package className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.sale.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">
                  Avg. Margin
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.avgMargin.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
         REPORT TABLE
      ===================================================== */}
      {generated && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Layers className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Stock Report
                  </h2>
                  <p className="text-sm text-gray-500">
                    {rows.length} records • {filters.groupBy.replace("_", " ")}{" "}
                    grouping
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Branch:{" "}
                <span className="font-semibold text-gray-900">
                  {branch?.name || user?.branchName || 'Your Branch'}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        {col.icon}
                        {col.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Loading report data...</p>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-12 h-12 text-gray-300" />
                        <div>
                          <p className="text-gray-500 font-medium">
                            No stock data found
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Try adjusting your filters or select a different
                            branch
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {columns.map((col) => {
                        let value = row[col.key];

                        // Format numeric values
                        if (
                          col.key.includes("Cost") ||
                          col.key.includes("Sale") ||
                          col.key.includes("Margin")
                        ) {
                          value = value
                            ? `${parseFloat(value).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "-";
                        } else if (col.key === "totalQty") {
                          value = value ? value.toLocaleString() : "-";
                        }

                        return (
                          <td
                            key={col.key}
                            className={`px-6 py-4 whitespace-nowrap ${
                              col.key === "totalMargin"
                                ? parseFloat(row[col.key] || 0) >= 0
                                  ? "text-emerald-600 font-semibold"
                                  : "text-red-600 font-semibold"
                                : "text-gray-900"
                            }`}
                          >
                            {value || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {rows.length} records • Generated at{" "}
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
import Modal from "../../../components/modals/Modal";
import Badge from "../../../components/ui/Badge";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Hash,
  Calendar,
  Building,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function StockTransferDetailsModal({ isOpen, setIsOpen, data }) {
  if (!data) return null;

    if (!data) {
    return (
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-10 text-center text-gray-500">
          Loading...
        </div>
      </Modal>
    );
  }

  
  const getStatusConfig = (status) => {
    const config = {
      RECEIVED: {
        color: "green",
        icon: CheckCircle,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      MISMATCH: {
        color: "red",
        icon: AlertCircle,
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      },
      PENDING: {
        color: "amber",
        icon: Clock,
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      },
      DEFAULT: {
        color: "blue",
        icon: Clock,
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
    };
    return config[status] || config.DEFAULT;
  };

  const statusConfig = getStatusConfig(data.status);

  // Calculate summary statistics
  const totalItems = data.items.length;
  const receivedItems = data.items.filter(
    (i) => i.status === "RECEIVED",
  ).length;
  const mismatchItems = data.items.filter(
    (i) => i.status === "MISMATCH",
  ).length;
  const pendingItems = data.items.filter((i) => i.status === "PENDING").length;

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title=""
      size="5xl"
      closeOnBackdrop={true}
      padding="p-0"
    >
      {/* ================= HEADER SECTION ================= */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}
              >
                <Package className={`w-6 h-6 ${statusConfig.text}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Stock Transfer
                </h1>
                <p className="text-lg font-semibold text-gray-600">
                  {data.transferNo}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                <span className="text-gray-400">•</span>
                <span>
                  {new Date(data.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div
                className={`px-2 py-1 border rounded-xl flex justify-center items-center text-xs ${statusConfig.border} ${statusConfig.bg}`}
                color={statusConfig.color}
              >
                <statusConfig.icon className="w-4 h-4 mr-2" />
                {data.status}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="px-8 py-8 space-y-8">
        {/* Branch Transfer Flow */}
        <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-8">
            {/* From Branch */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Source Branch
                </span>
              </div>
              <div className="pl-10">
                <p className="text-xl font-semibold text-gray-900">
                  {data.fromBranch.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Code: {data.fromBranch.code}
                </p>
              </div>
            </div>

            {/* Transfer Direction */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 border-dashed"></div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="p-3 bg-white border border-gray-300 rounded-full shadow-sm">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* To Branch */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Destination Branch
                </span>
              </div>
              <div className="pl-10">
                <p className="text-xl font-semibold text-gray-900">
                  {data.toBranch.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Code: {data.toBranch.code}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Total Items
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
            <div className="text-xs text-gray-500 mt-2">In this transfer</div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
              <CheckCircle className="w-4 h-4" />
              Received
            </div>
            <div className="text-3xl font-bold text-emerald-700">
              {receivedItems}
            </div>
            <div className="text-xs text-emerald-600 mt-2">
              {Math.round((receivedItems / totalItems) * 100)}% complete
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
              <Clock className="w-4 h-4" />
              Pending
            </div>
            <div className="text-3xl font-bold text-amber-700">
              {pendingItems}
            </div>
            <div className="text-xs text-amber-600 mt-2">Awaiting receipt</div>
          </div>

          <div className="bg-white border border-rose-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-700 mb-2">
              <AlertCircle className="w-4 h-4" />
              Mismatch
            </div>
            <div className="text-3xl font-bold text-rose-700">
              {mismatchItems}
            </div>
            <div className="text-xs text-rose-600 mt-2">Requires attention</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transfer Items
                  </h3>
                  <p className="text-sm text-gray-600">
                    Detailed breakdown of all items in this transfer
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {data.items.length} items
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Attributes
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                    Sent Qty
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                    Received Qty
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.items.map((i, idx) => {
                  const itemStatusConfig = getStatusConfig(i.status);
                  const isMismatch = i.status === "MISMATCH";
                  const discrepancy = Math.abs(i.sentQty - i.receivedQty);

                  return (
                    <tr
                      key={i._id}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="py-5 px-6">
                        <div className="space-y-1.5">
                          <p className="font-medium text-gray-900">
                            {i.productName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              {idx + 1}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <code className="font-mono text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
                            {i.variant.sku}
                          </code>
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <div className="space-y-2">
                          {i.variant.attributes?.size && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Size:
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {i.variant.attributes.size}
                              </span>
                            </div>
                          )}
                          {i.variant.attributes?.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Color:
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{
                                    backgroundColor:
                                      i.variant.attributes.color.toLowerCase(),
                                  }}
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  {i.variant.attributes.color}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-semibold text-gray-900">
                              {i.sentQty}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`text-xl font-semibold ${isMismatch ? "text-rose-600" : "text-emerald-600"}`}
                          >
                            {i.receivedQty}
                          </div>
                          {isMismatch && (
                            <div className="mt-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-full">
                              -{discrepancy}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <div
                          className={`px-2 py-1 border rounded-xl flex justify-center items-center text-xs ${itemStatusConfig.border} ${itemStatusConfig.bg}`}
                          color={itemStatusConfig.color}
                        >
                          <itemStatusConfig.icon className="w-4 h-4 mr-2" />
                          {i.status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-linear-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Transfer Progress
            </h4>
            <span className="text-sm text-gray-600">
              {receivedItems} of {totalItems} items received
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium text-gray-900">
                {Math.round((receivedItems / totalItems) * 100)}%
              </span>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(receivedItems / totalItems) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Received: {receivedItems}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Pending: {pendingItems}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <span>Mismatch: {mismatchItems}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

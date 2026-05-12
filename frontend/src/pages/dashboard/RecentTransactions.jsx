import { useMemo } from "react";
import { formatShortDate } from "../../utils/formatDate";

export const RecentTransactions = ({ transactions }) => {
  const statusColors = {
    COMPLETED:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    PENDING:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    REFUNDED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const formattedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    return transactions.map((t) => ({
      id: t.id,
      customer: t.customerId?.substring(0, 8) + "..." || "Unknown",
      amount: `${t.amount.toLocaleString()}`,
      status: t.status,
      time: formatShortDate(t.createdAt),
    }));
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Latest sales and returns
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left pb-3 font-medium text-gray-500 dark:text-gray-400">
                Invoice
              </th>
              {/* <th className="text-left pb-3 font-medium text-gray-500 dark:text-gray-400">
                Customer
              </th> */}
              <th className="text-left pb-3 font-medium text-gray-500 dark:text-gray-400">
                Amount
              </th>
              <th className="text-left pb-3 font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="text-left pb-3 font-medium text-gray-500 dark:text-gray-400">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {formattedTransactions?.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
              >
                <td className="py-4">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    #{transaction.id}
                  </p>
                </td>
                {/* <td className="py-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.customer}
                  </p>
                </td> */}
                <td className="py-4">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {transaction.amount}
                  </p>
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction.time}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {formattedTransactions?.length} recent transactions
        </p>
      </div>
    </div>
  );
};
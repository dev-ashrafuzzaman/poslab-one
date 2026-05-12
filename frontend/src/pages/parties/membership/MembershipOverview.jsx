import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";

/* =====================================================
   Membership Overview
===================================================== */
export default function MembershipOverview({ customerId }) {
  const { request } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function for status colors
  function getStatusColor(status) {
    const statusMap = {
      active: "bg-green-50 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      pending: "bg-yellow-50 text-yellow-700",
      suspended: "bg-red-50 text-red-700",
    };
    return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  }

  useEffect(() => {
    if (!customerId) return;

    setLoading(true);
    request(`/memberships/${customerId}`, "GET")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [customerId, request]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-500">Loading membership overview…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-3">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <p className="text-red-600 font-medium">No data found</p>
        <p className="text-gray-500 text-sm mt-1">
          Unable to load membership information
        </p>
      </div>
    );
  }

  const { customer, membership, loyalty, purchases, settings, branches } = data;
  const summary = purchases.summary;

  return (
    <div className="space-y-6">
      {/* =====================================================
         TOP: CUSTOMER + MEMBERSHIP
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Customer Information
            </h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm text-gray-500">Name</span>
              <span className="text-sm font-medium text-gray-900">
                {customer.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="text-sm font-medium text-gray-900">
                {customer.phone}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
              <span className="text-sm text-gray-500">Customer Code</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {customer.code}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
              <span className="text-sm text-gray-500">Status</span>
              <div
                className={`px-2.5 py-1 rounded text-xs font-medium ${getStatusColor(customer.status)}`}
              >
                {customer.status}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Membership
            </h3>
          </div>

          {membership ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-gray-500">Member Code</span>
                <span className="text-sm font-mono font-medium text-gray-900">
                  {membership.memberCode}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
                <span className="text-sm text-gray-500">Status</span>
                <div
                  className={`px-2.5 py-1 rounded text-xs font-medium ${getStatusColor(membership.status)}`}
                >
                  {membership.status}
                </div>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
                <span className="text-sm text-gray-500">Activated At</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(membership.activatedAt)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No active membership</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
         LOYALTY PROGRESS
      ====================================================== */}
      <InfoCard title="Loyalty Progress" icon="trophy">
        {loyalty ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Cycle {loyalty.cycleNo}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  Progress: {loyalty.current}/{loyalty.required}
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600">
                {loyalty.remaining} remaining
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-xs text-gray-500">
                  {Math.round((loyalty.current / loyalty.required) * 100)}%
                  complete
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                <div
                  style={{
                    width: `${(loyalty.current / loyalty.required) * 100}%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-600"
                ></div>
              </div>
            </div>

            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
              Reward Type:{" "}
              <strong className="ml-1">{settings.rewardType}</strong>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-50 text-yellow-500 mb-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No running loyalty cycle</p>
          </div>
        )}
      </InfoCard>

      {/* =====================================================
         KPI SUMMARY
      ====================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Spent"
          value={`${summary.totalSpent}`}
          icon="currency"
          color="blue"
        />
        <KpiCard
          title="Discount Gain"
          value={`${summary.totalDiscountGain}`}
          icon="discount"
          color="green"
        />
        <KpiCard
          title="Reward Redeemed"
          value={`${summary.totalBillDiscount}`}
          icon="gift"
          color="purple"
        />
        <KpiCard
          title="Invoices"
          value={summary.totalInvoices}
          icon="document"
          color="orange"
        />
      </div>

      {/* =====================================================
         BRANCH USAGE
      ====================================================== */}
      <InfoCard title="Branch Usage" icon="location">
        {branches.length ? (
          <div className="space-y-3">
            {branches.map((b) => (
              <div
                key={b.branchId}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 mr-3">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {b.branchName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last purchase: {formatDate(b.lastUsedAt)}
                    </div>
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  Visit
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-400 mb-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No branch usage found</p>
          </div>
        )}
      </InfoCard>

      {/* =====================================================
         INVOICE HISTORY
      ====================================================== */}
      <InfoCard title="Invoice History" icon="receipt">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Invoice</Th>
                  <Th>Branch</Th>
                  <Th>Date</Th>
                  <Th>Discount Gain</Th>
                  <Th>Reward Used</Th>
                  <Th>Paid</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <Td mono>
                      <span className="font-medium text-gray-900">
                        {inv.invoiceNo}
                      </span>
                    </Td>
                    <Td>
                      <div className="text-gray-700">{inv.branchName}</div>
                    </Td>
                    <Td>
                      <div className="text-gray-700">
                        {formatDate(inv.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(inv.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </Td>
                    <Td>
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 font-medium">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {inv.totalDiscountGain}
                      </div>
                    </Td>
                    <Td>
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 font-medium">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {inv.billDiscount}
                      </div>
                    </Td>
                    <Td>
                      <div className="font-semibold text-gray-900">
                        {inv.grandTotal}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}

/* =====================================================
   UI HELPERS
===================================================== */

function InfoCard({ title, children, icon }) {
  const icons = {
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    badge:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    trophy:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    location:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    receipt:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 mr-3">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={icons[icon]}
              />
            </svg>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
  };

  const color = colors[status?.toLowerCase()] || colors.inactive;

  return (
    <div className="inline-flex items-center">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {status}
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const icons = {
    currency:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    discount:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    gift: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
    document:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={icons[icon]}
            />
          </svg>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, mono }) {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm ${mono ? "font-mono" : ""}`}
    >
      {children}
    </td>
  );
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

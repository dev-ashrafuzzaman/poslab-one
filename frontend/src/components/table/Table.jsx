// components/table/Table.jsx
import Skeleton from "../skeletons/SkeletonCard";
import EmptyState from "./EmptyState";
import TableActions from "./TableActions";

export default function Table({
  columns,
  data = [],
  actions = [],
  loading = false,
  table,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm">
        <Skeleton type="table" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border shadow-sm">
        <EmptyState
          title="No vendors found"
          description="Your search did not match any vendors. Please try again or create a new vendor."
          onClear={() => table?.resetQuery?.()}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-4 py-3 text-left font-medium text-gray-700">
                  {c.label}
                </th>
              ))}

              {actions.length > 0 && (
                <th className="px-4 py-3 text-center font-medium text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row._id || index}
                className={`
                  border-b border-gray-100
                  ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  hover:bg-gray-100/60
                  transition-colors
                `}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className="px-4 py-2.5 text-gray-800 whitespace-nowrap">
                    {c.render
                      ? c.render(row)
                      : (c.key.split(".").reduce((o, k) => o?.[k], row) ?? "—")}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td className="px-4 py-2.5 text-center">
                    <TableActions
                      row={row}
                      actions={actions}
                      onSuccess={table?.refetch}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

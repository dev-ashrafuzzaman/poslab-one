// components/table/DataTable.jsx
import TableHeader from "./TableHeader";
import Table from "./Table";
import PaginationBar from "./PaginationBar";
import TableToolbar from "./TableToolbar";
import { SIMPLE_TABLE_TOOLBAR } from "./defaultTableConfig";

export default function DataTable({
  table,
  title,
  subtitle,
  columns,
  actions,
  headerActions,
  tabs,
  config = SIMPLE_TABLE_TOOLBAR,
}) {
  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      <TableHeader
        title={title}
        subtitle={subtitle}
        count={table.pagination?.total}
        actions={headerActions}
      />

      <TableToolbar
        tabs={tabs}
        activeTab={table.query?.status}
        config={config}
        table={table}
      />

      <Table
        columns={columns}
        data={table.rows}
        actions={actions}
        loading={table.loading}
        table={table}
      />

      <PaginationBar pagination={table.pagination} setQuery={table.setQuery} />
    </div>
  );
}

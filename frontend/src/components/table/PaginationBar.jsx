export default function PaginationBar({ pagination = {}, setQuery }) {
  const {
    page = 1,
    totalPages = 1,
    limit = 10,
    total = 0,
  } = pagination;

  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="bg-white p-3 border border-gray-100 rounded-lg flex justify-between items-center">
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages} • {total} records
      </span>

      <div className="flex gap-2 items-center">
        <select
          value={limit}
          onChange={(e) => setQuery("limit", Number(e.target.value))}
          className="border border-gray-200 px-2 py-1.5 rounded text-sm"
        >
          {[10, 25, 50, 100].map((l) => (
            <option key={l} value={l}>
              {l}/page
            </option>
          ))}
        </select>

        <button
          disabled={page <= 1}
          onClick={() => setQuery("page", page - 1)}
          className="border border-gray-200 px-3 hover:border-gray-500 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <button
          disabled={page >= totalPages}
          onClick={() => setQuery("page", page + 1)}
          className="border border-gray-200 hover:border-gray-500 px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

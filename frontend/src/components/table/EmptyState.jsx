// components/table/EmptyState.jsx
import { Search } from "lucide-react";
import Button from "../ui/Button";

export default function EmptyState({
  title = "No records found",
  description,
  onClear,
  onCreate,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 mb-4">
        <Search size={24} className="text-gray-500" />
      </div>

      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1 max-w-md">
          {description}
        </p>
      )}

      <div className="flex gap-3 mt-4">
        {onClear && (
          <Button variant="secondary" onClick={onClear}>
            Clear search
          </Button>
        )}
        {onCreate && (
          <Button onClick={onCreate}>
            + New project
          </Button>
        )}
      </div>
    </div>
  );
}

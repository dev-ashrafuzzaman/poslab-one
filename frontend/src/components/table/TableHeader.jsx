import Button from "../ui/Button";

// components/table/TableHeader.jsx
export default function TableHeader({
  title,
  subtitle="Manage your records efficiently with ease.",
  count,
  actions = [],
}) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex gap-2">
        {actions.map((a, i) => (
          <Button
            key={i}
            variant={a.variant || "secondary"}
            onClick={a.onClick}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

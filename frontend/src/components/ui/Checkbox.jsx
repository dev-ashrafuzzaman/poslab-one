import clsx from "clsx";

const Checkbox = ({ label, className = "", labelClassName = "", ...props }) => {
  return (
    <label
      className={clsx(
        "inline-flex items-center justify-center gap-2 cursor-pointer select-none leading-none", 
        className
      )}
    >
      <input
        type="checkbox"
        className="size-4 shrink-0 rounded border-gray-300 text-(--primary) focus:ring-(--primary)"
        {...props}
      />
      {label && (
        <span
          className={clsx(
            "text-sm text-gray-700  transition-colors leading-none",
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
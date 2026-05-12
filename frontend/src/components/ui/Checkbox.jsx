import clsx from "clsx";

const Checkbox = ({ label, className = "", labelClassName = "", ...props }) => {
  return (
    <label
      className={clsx(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        className
      )}
    >
      <input
        type="checkbox"
        className="size-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] dark:border-[var(--primary)] dark:bg-[var(--primary)]"
        {...props}
      />
      {label && (
        <span
          className={clsx(
            "text-sm text-gray-700 dark:text-gray-300 transition-colors",
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

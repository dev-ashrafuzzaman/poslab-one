import { forwardRef, memo } from "react";
import clsx from "clsx";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      prefix,
      error,
      className = "",        // Wrapper div class
      labelClassName = "",   // Label text class
      inputClassName = "",   // Input field class
      ...props               // Must include value, onChange, name (from Controller)
    },
    ref
  ) => {
    return (
      <div className={clsx("w-full", className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.name}
            className={clsx(
              "mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300 select-none",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div
          className={clsx(
            "flex items-center rounded-lg border px-3 py-2 transition-all duration-150 focus-within:ring-2",
            error
              ? "border-red-500 focus-within:ring-red-300"
              : "border-gray-300 dark:border-dark-400 focus-within:border-primary-500 focus-within:ring-[var(--secondary)] dark:focus-within:ring-[var(--secondary)]",
            "bg-white dark:bg-dark-800"
          )}
        >
          {/* Prefix Icon */}
          {prefix && (
            <div className="mr-2 flex-shrink-0 text-gray-400">{prefix}</div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={props.name}
            type={type}
            placeholder={placeholder}
            {...props} // ✅ Keeps React Hook Form value/onChange intact
            className={clsx(
              "w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-sm",
              inputClassName
            )}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default memo(Input);

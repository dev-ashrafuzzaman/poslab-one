import { forwardRef, memo } from "react";
import clsx from "clsx";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      prefix,
      suffix,               
      error,
      title = "",           
      showLabel = true,     
      className = "",        
      labelClassName = "",   
      inputClassName = "",  
      ...props              
    },
    ref
  ) => {
    return (
      <div className={clsx("w-full", className)} title={title}>
        {/* Label */}
        {label && showLabel && (
          <label
            htmlFor={props.name}
            className={clsx(
              "mb-1 block text-sm font-medium text-gray-600 select-none",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        {/* Input Wrapper Container */}
        <div
          className={clsx(
            "flex items-center h-10 rounded-lg border px-3 transition-all duration-150 focus-within:ring-2",
            error
              ? "border-red-500 focus-within:ring-red-300"
              : "border-gray-300 focus-within:border-primary-500 focus-within:ring-(--secondary)",
            "bg-white"
          )}
        >
          {prefix && (
            <div className="mr-2.5 shrink-0 text-gray-400 flex items-center justify-center">
              {prefix}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={props.name}
            type={type}
            placeholder={placeholder}
            {...props}
            className={clsx(
              "w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm h-full leading-none",
              inputClassName
            )}
          />

          {suffix && (
            <div className="ml-2 shrink-0 text-gray-400 flex items-center justify-center">
              {suffix}
            </div>
          )}
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
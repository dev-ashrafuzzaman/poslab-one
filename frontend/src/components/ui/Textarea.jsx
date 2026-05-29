/* ========================================================================== */
/*                                  Textarea.jsx                              */
/* ========================================================================== */

import clsx from "clsx";

export default function Textarea({
  label,
  error,
  helperText,

  className = "",
  rows = 4,

  required = false,

  ...props
}) {
  return (
    <div className="w-full">
      {/* ---------------- Label ---------------- */}
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      {/* ---------------- Textarea ---------------- */}
      <textarea
        rows={rows}
        className={clsx(
          `
          w-full rounded-xl border bg-white px-4 py-3
          text-sm text-gray-900 placeholder:text-gray-400
          outline-none transition-all duration-200 resize-none

          focus:ring-2 focus:ring-blue-500/20
          `,

          error
            ? "border-red-300 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500",

          className
        )}
        {...props}
      />

      {/* ---------------- Helper ---------------- */}
      {!error && helperText && (
        <p className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}

      {/* ---------------- Error ---------------- */}
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
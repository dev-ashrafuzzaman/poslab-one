import React from "react";
import clsx from "clsx";

/**
 * Modern, animated, dynamic skeleton loader component
 *
 * @param {string} type - preset type: "card" | "table" | "list" | "circle"
 * @param {string} color - color tone: "gray" | "blue" | "slate" | "primary"
 * @param {string | number} width - width (e.g. "100%", "300px", "w-64")
 * @param {string | number} height - height (e.g. "200px", "h-48")
 * @param {number} count - number of skeleton items
 */
export default function Skeleton({
  type = "card",
  color = "gray",
  width = "100%",
  height = "auto",
  count = 1,
}) {
  const baseColor = {
    gray: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100",
    blue: "bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100",
    slate: "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100",
    primary: "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200",
  }[color];

    const numericHeight =
    typeof height === "string"
      ? parseFloat(height)
      : height || 200;

  // 🔹 Calculate proportional heights
  const titleH = numericHeight * 0.12;
  const line1H = numericHeight * 0.08;
  const line2H = numericHeight * 0.08;

  const shimmer =
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent";

  const skeletonBase = clsx("rounded-md", baseColor, shimmer);

  const types = {
    card: (
   <div
      className={clsx(
        "animate-pulse p-4 rounded-xl border border-gray-200 bg-white"
      )}
      style={{ width, height }}
    >
      <div
        className={clsx(skeletonBase, "w-3/4 mb-3")}
        style={{ height: titleH }}
      />
      <div
        className={clsx(skeletonBase, "w-full mb-2")}
        style={{ height: line1H }}
      />
      <div
        className={clsx(skeletonBase, "w-5/6")}
        style={{ height: line2H }}
      />
    </div>
    ),
    table: (
      <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center border-b border-gray-300 p-3">
            <div className={`${skeletonBase} h-10 w-10 rounded-lg`} />
            <div className="flex-1 space-y-2">
              <div className={`${skeletonBase} h-4 w-3/4`} />
              <div className={`${skeletonBase} h-3 w-2/4`} />
            </div>
            <div className={`${skeletonBase} h-4 w-16`} />
          </div>
        ))}
      </div>
    ),
    list: (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${skeletonBase} h-5 w-full rounded`} />
        ))}
      </div>
    ),
    circle: (
      <div className={`${skeletonBase} w-16 h-16 rounded-full`} />
    ),
  };

  return (
    <div
      className={clsx(
        "animate-pulse",
        typeof width === "string" && width.startsWith("w-") ? width : "",
        typeof height === "string" && height.startsWith("h-") ? height : ""
      )}
      style={{
        width: !width.startsWith?.("w-") ? width : undefined,
        height: !height.startsWith?.("h-") ? height : undefined,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-3 last:mb-0">
          {types[type]}
        </div>
      ))}
    </div>
  );
}

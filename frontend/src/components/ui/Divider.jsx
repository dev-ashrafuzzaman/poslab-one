import clsx from "clsx";

const Divider = ({ label, className = "", color = "gray" }) => {
  const colorMap = {
    gray: "from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
    blue: "from-blue-200 via-blue-400 to-blue-200 dark:from-blue-900 dark:via-blue-700 dark:to-blue-900",
    indigo: "from-indigo-200 via-indigo-400 to-indigo-200 dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900",
  };

  return (
    <div className={clsx("relative w-full flex items-center justify-center my-8", className)}>
      {/* line */}
      <div className={clsx("h-[1px] w-full bg-gradient-to-r", colorMap[color])}></div>

      {/* label */}
      {label && (
        <span
          className="absolute bg-white dark:bg-dark-800 px-3 text-sm text-gray-500 dark:text-gray-300 font-medium"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Divider;

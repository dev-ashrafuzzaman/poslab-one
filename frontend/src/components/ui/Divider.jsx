import clsx from "clsx";

const Divider = ({ label, className = "", color = "gray" }) => {
  const colorMap = {
    gray: "from-gray-200 via-gray-300 to-gray-200",
    blue: "from-blue-200 via-blue-400 to-blue-200",
    indigo: "from-indigo-200 via-indigo-400 to-indigo-200",
  };

  return (
    <div className={clsx("relative w-full flex items-center justify-center my-8", className)}>
      {/* line */}
      <div className={clsx("h-px w-full bg-linear-to-r", colorMap[color])}></div>

      {/* label */}
      {label && (
        <span
          className="absolute bg-white px-3 text-sm text-gray-500 font-medium"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Divider;
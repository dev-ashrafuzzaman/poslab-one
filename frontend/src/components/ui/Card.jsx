// src/components/ui/Card.jsx
import clsx from "clsx";

const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white p-4 shadow-md dark:bg-dark-700 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

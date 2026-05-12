import React from "react";

const PrintWrapper = React.forwardRef(({ children, className = "" }, ref) => {
  return (
    <div ref={ref} className={`print-area ${className}`}>
      {children}
    </div>
  );
});

export default PrintWrapper;

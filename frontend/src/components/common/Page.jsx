// src/components/common/Page.jsx
import { useEffect } from "react";
import { Config } from "../../utils/constants";
const Page = ({ title, children, className = "" }) => {
  useEffect(() => {
    if (title) document.title = `${title} | ${Config.app.name}`;
  }, [title]);

  return (
    <div className={`min-h-screen  ${className}`}>
      {children}
    </div>
  );
};

export default Page;

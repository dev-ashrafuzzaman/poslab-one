import React from "react";
import Card from "../ui/Card";

const PageHeader = ({ title, subTitle, icon: Icon, action }) => {
  return (
    <Card className="bg-linear-to-r from-blue-600 to-indigo-500 text-white shadow-lg mb-6 p-5 rounded-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-white" />}
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {title}
            </h1>
            {subTitle && (
              <p className="text-blue-100 mt-1 text-sm">{subTitle}</p>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        {action && (
          <div className="self-end md:self-center shrink-0">{action}</div>
        )}
      </div>
    </Card>
  );
};

export default PageHeader;

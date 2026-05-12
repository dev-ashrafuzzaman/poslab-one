import { useMemo } from "react";

export const CategoryDistribution = ({ data }) => {
  // Default colors if not provided in API
  const defaultColors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Return empty array or placeholder data
      return [];
    }

    return data.map((item, index) => ({
      ...item,
      color: item.color || defaultColors[index % defaultColors.length],
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Distribution
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No category data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Category Distribution
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sales by product category
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative w-full h-65">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {chartData?.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.value}% of total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {category.sales?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

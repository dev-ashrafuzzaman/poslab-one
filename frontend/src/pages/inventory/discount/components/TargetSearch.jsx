import { useEffect, useState } from "react";
import useApi from "../../../../hooks/useApi";

export default function TargetSearch({ targetType, onSelect }) {
  const { request } = useApi();
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!search || targetType === "BILL") {
      setList([]);
      return;
    }

    const routeMap = {
      PRODUCT: `/products?search=${search}&limit=10`,
      CATEGORY: `/categories?level=1&search=${search}&limit=10`,
      BRANCH: `/branches?search=${search}&limit=10`,
    };

    request(routeMap[targetType], "GET").then(
      (res) => setList(res?.data || [])
    );
  }, [search, targetType]);

  if (targetType === "BILL") return null;

  return (
    <div className="space-y-2">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${targetType.toLowerCase()}...`}
        className="w-full px-4 py-3 border rounded-lg"
      />

      {list.length > 0 && (
        <div className="border rounded-lg max-h-48 overflow-auto bg-white">
          {list.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                onSelect(item);
                setSearch("");
                setList([]);
              }}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {item.name || item.code}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

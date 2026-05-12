import Button from "../../../components/ui/Button";
import { ArrowRightLeft, Package } from "lucide-react";

const TransferFooter = ({
  items,
  loading,
  onSubmit,
}) => {
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Items</p>
              <p className="text-lg font-semibold text-gray-900">{items.length}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gray-200"></div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ArrowRightLeft className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Quantity</p>
              <p className="text-lg font-semibold text-gray-900">{totalQty}</p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={onSubmit}
          loading={loading}
          disabled={!items.length}
          className="min-w-[180px]"
          icon={<ArrowRightLeft className="h-5 w-5" />}
        >
          {loading ? "Processing..." : "Transfer Stock"}
        </Button>
      </div>
    </div>
  );
};

export default TransferFooter;
import { useEffect, useRef, useState, useCallback } from "react";
import Page from "../../../components/common/Page";
import useApi from "../../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightLeft,
  Package,
  AlertCircle,
  CheckCircle,
  Truck,
  Warehouse,
  Scan,
  Plus,
} from "lucide-react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import TransferHeader from "../components/TransferHeader";
import TransferItemSearch from "../components/TransferItemSearch";
import TransferItemsTable from "../components/TransferItemTable";

const CreateStockTransferPage = () => {
  const { request, loading } = useApi();
  const searchRef = useRef(null);
  const navigate = useNavigate();

  /* ===============================
     STATE
  =============================== */
  const [fromBranch, setFromBranch] = useState(null);
  const [toBranch, setToBranch] = useState(null);
  const [items, setItems] = useState([]);

  /* ===============================
     RESET ON SOURCE CHANGE
  =============================== */
  useEffect(() => {
    setItems([]);
    searchRef.current?.clearAndFocus();
  }, [fromBranch?._id]);

  /* ===============================
     ADD ITEM (SCAN / SEARCH)
  =============================== */
  const handleAddItem = useCallback((raw) => {
    if (!raw) return;

    const availableQty = Number(raw.qty) || 0;
    if (availableQty <= 0) return;

    setItems((prev) => {
      const index = prev.findIndex((i) => i.variantId === raw.variantId);

      /* ---------- Already Added ---------- */
      if (index !== -1) {
        const current = prev[index];

        if (current.qty >= current.availableQty) return prev;

        const updated = [...prev];
        updated[index] = {
          ...current,
          qty: Math.min(current.qty + 1, current.availableQty),
        };
        return updated;
      }

      /* ---------- New Entry ---------- */
      return [
        ...prev,
        {
          variantId: raw.variantId,
          sku: raw.sku,
          productName: raw.productName,
          attributes: raw.attributes,
          unit: raw.unit,

          availableQty, // 🔒 stock snapshot
          qty: 1,

          costPrice: raw.costPrice || 0, // 🔒 future accounting safe
        },
      ];
    });

    // POS speed
    searchRef.current?.clearAndFocus();
  }, []);

  /* ===============================
     SUBMIT TRANSFER
  =============================== */
  const submitTransfer = async () => {
    if (!fromBranch || !toBranch) {
      alert("Please select both source and destination branches");
      return;
    }

    if (fromBranch._id === toBranch._id) {
      alert("Source and destination cannot be the same");
      return;
    }

    if (!items.length) {
      alert("No items selected for transfer");
      return;
    }

    const payload = {
      transferType: "BRANCH_TO_BRANCH",
      fromBranchId: fromBranch._id,
      toBranchId: toBranch._id,
      items: items.map((i) => ({
        variantId: i.variantId,
        sku: i.sku,
        qty: Number(i.qty),
        costPrice: i.costPrice,
      })),
    };

    await request("/stocks/transfers", "POST", payload, {
      successMessage:
        "Stock transfer initiated successfully. Awaiting receive confirmation at destination.",
      onSuccess: () => {
        setItems([]);
        navigate("/inventory/manage-transfer");
        searchRef.current?.clearAndFocus();
      },
      onError: (err) => {
        if (
          err?.message?.includes("Insufficient stock") ||
          err?.message?.includes("stock")
        ) {
          alert(
            "Stock availability has changed. Please re-scan items and try again.",
          );
          setItems([]);
        }
      },
    });
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <Page
      title={"Create Stock Transfer"}
      subTitle={"Branch to branch / warehouse stock transfe"}
      actions={
        <div className="flex items-center gap-3">
          <Badge
            variant={items.length > 0 ? "success" : "secondary"}
            className="px-3 py-1.5"
          >
            <Package className="h-4 w-4 mr-1.5" />
            {items.length} items
          </Badge>
        </div>
      }
    >
      <div className="space-y-6">
        {/* -------- Transfer Flow Header -------- */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Transfer Details
                </h2>
                <p className="text-sm text-gray-500">
                  Select source and destination branches
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Warehouse className="h-4 w-4" />
                <span>Branch Transfer</span>
              </div>
            </div>

            <TransferHeader
              fromBranch={fromBranch}
              toBranch={toBranch}
              setFromBranch={setFromBranch}
              setToBranch={setToBranch}
            />
          </div>
        </Card>

        {/* -------- Quick Stats -------- */}
        {fromBranch && toBranch && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-100">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      From Branch
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {fromBranch.name}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Warehouse className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-green-100">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      To Branch
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {toBranch.name}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-linear-to-r from-purple-50 to-violet-50 border-purple-100">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Items
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {items.length}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* -------- Item Search -------- */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Items
                </h3>
                <p className="text-sm text-gray-500">
                  Scan barcode or search products to add to transfer
                </p>
              </div>
              {!fromBranch && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Select source branch first
                  </span>
                </div>
              )}
            </div>

            <TransferItemSearch
              ref={searchRef}
              fromBranchId={fromBranch?._id || null}
              disabled={!fromBranch}
              onSelect={handleAddItem}
              placeholder={
                fromBranch
                  ? "Scan barcode or search by SKU/Name..."
                  : "Select source branch to enable search"
              }
            />

            {fromBranch && items.length === 0 && (
              <div className="mt-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <Scan className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No items added yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start scanning or searching to add items
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* -------- Items Table -------- */}
        {items.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transfer Items
                  </h3>
                  <p className="text-sm text-gray-500">
                    Review and adjust quantities before transfer
                  </p>
                </div>
                <Badge variant="primary" className="px-3 py-1.5">
                  <Package className="h-4 w-4 mr-1.5" />
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <TransferItemsTable items={items} setItems={setItems} />
            </div>
          </Card>
        )}

        {/* -------- Footer -------- */}
        {items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-xl font-bold text-gray-900">
                      {items.length}
                    </p>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ArrowRightLeft className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Quantity</p>
                    <p className="text-xl font-bold text-gray-900">
                      {items.reduce((sum, i) => sum + i.qty, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setItems([])}
                  disabled={loading}
                  className="px-6"
                >
                  Clear All
                </Button>
                <Button
                  size="lg"
                  onClick={submitTransfer}
                  loading={loading}
                  disabled={!items.length || !fromBranch || !toBranch}
                  className="px-8"
                  icon={<Truck className="h-5 w-5" />}
                >
                  {loading ? "Processing..." : "Initiate Transfer"}
                </Button>
              </div>
            </div>

            {(!fromBranch || !toBranch) && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-sm">
                    {!fromBranch && !toBranch
                      ? "Select source and destination branches to proceed"
                      : !fromBranch
                        ? "Select source branch to proceed"
                        : "Select destination branch to proceed"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
};

export default CreateStockTransferPage;

import {
  Crown,
  ShoppingBag,
  Clock,
  User,
  Phone,
  TrendingUp,
} from "lucide-react";

export default function PosCustomerInfo({ summary }) {
  if (!summary) return null;

  const { customer, membership, loyalty, purchases } = summary;

  // Calculate loyalty progress percentage
  const loyaltyProgress = loyalty
    ? Math.min(100, (loyalty.current / loyalty.required) * 100)
    : 0;

  return (
    <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      {/* Customer Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {customer.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-sm">{customer.phone}</span>
          </div>
        </div>

        {/* Membership Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${membership ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-600"}`}
        >
          <div className="flex items-center gap-1">
            {membership ? (
              <>
                <Crown className="w-3 h-3" />
                {membership.status}
              </>
            ) : (
              "Non-member"
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Loyalty Progress */}
      {loyalty && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Loyalty Progress</span>
            </div>
            <span className="font-semibold text-gray-900">
              {loyalty.current} / {loyalty.required}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${loyaltyProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Purchase Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <ShoppingBag className="w-3.5 h-3.5 text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Total Orders{" "}
              <p className="text-md font-bold text-gray-900">
                {purchases.totalOrders}
              </p>
            </span>
          </div>
        </div>

        {purchases.lastPurchaseAt && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-gray-700" />
              </div>
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Last Purchase:
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(purchases.lastPurchaseAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

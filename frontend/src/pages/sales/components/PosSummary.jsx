import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function PosSummary({
  subtotal,
  billDiscount,
  grandTotal,
  onPay,
  customerSummary,
  canProceed,
}) {
  const loyalty = customerSummary?.loyalty;
  const settings = customerSummary?.settings;

  const rewardEligible =
    !!loyalty &&
    !!settings &&
    loyalty.current + 1 === settings.requiredCount &&
    subtotal >= settings.minDailyPurchase;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review purchase details
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Summary Details */}
      <div className="px-6 pb-6 space-y-5">
        {/* Amount Breakdown */}
        <div className="space-y-3.5">
          {rewardEligible && (
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-gray-600 font-medium">Subtotal</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {subtotal.toLocaleString()}
              </span>
            </div>
          )}

          {/* Loyalty Reward Section */}
          {rewardEligible && (
            <div className="bg-linear-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-800">
                      Loyalty Reward
                    </h4>
                    <p className="text-xs text-emerald-600">
                      Eligible for discount
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-100 rounded-full">
                  <span className="text-xs font-medium text-emerald-800">
                    Applied
                  </span>
                </div>
              </div>

              <Input
                type="number"
                onWheel={(e) => e.currentTarget.blur()}
                value={billDiscount}
                disabled
                className="w-full bg-white border-emerald-200 text-emerald-800 font-medium"
              />

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs text-emerald-700">
                    Min. purchase: {settings.minDailyPurchase.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-emerald-500">Auto-applied</span>
              </div>
            </div>
          )}

          {/* Total Section */}
          <div className="border-t border-gray-100 pt-4">
            <div className="bg-linear-to-r from-gray-50 to-gray-100/50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    Total Payable
                  </div>
                  {billDiscount > 0 && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-medium text-emerald-600">
                        Saved {billDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {grandTotal.toLocaleString()}
                  </div>
                  {/* <div className="text-xs text-gray-500 mt-0.5">Inclusive of all charges</div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="gradient"
            className="w-full py-3.5 text-base font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            onClick={onPay}
            disabled={!canProceed}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Proceed to Payment</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </Button>

          {!canProceed && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs text-red-700 font-medium">
                  Minimum purchase required:{" "}
                  {settings?.minDailyPurchase.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

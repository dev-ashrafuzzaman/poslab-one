import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Percent, Tag, Globe, Clock, Hash, Package, CreditCard } from "lucide-react";
import TargetSearch from "./components/TargetSearch";
import useApi from "../../../hooks/useApi";

export default function DiscountCreatePage() {
  const { request } = useApi();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "PERCENT",
    value: "",
    targetType: "PRODUCT",
    targetId: null,
    targetLabel: "",
    startDate: "",
    endDate: "",
    isLifetime: false,
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    if (!form.name || !form.value || !form.startDate) {
      return toast.error("Required fields missing");
    }

    if (form.targetType !== "BILL" && !form.targetId) {
      return toast.error("Target not selected");
    }

    setLoading(true);
    try {
      await request("/discounts", "POST", {
        ...form,
        targetId: form.targetType === "BILL" ? null : form.targetId,
      });
      toast.success("Discount created successfully");
      reset();
    } catch (e) {
      toast.error(e?.message || "Failed to create discount");
    } finally {
      setLoading(false);
    }
  };

  const reset = () =>
    setForm({
      name: "",
      type: "PERCENT",
      value: "",
      targetType: "PRODUCT",
      targetId: null,
      targetLabel: "",
      startDate: "",
      endDate: "",
      isLifetime: false,
    });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Discount Campaign</h1>
          <p className="text-gray-600 mt-2">Set up promotional discounts for products, categories, or branches</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
          {/* Campaign Name Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">Campaign Name</label>
            </div>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              placeholder="e.g., Eid Sale 2026, Summer Promotion, Black Friday"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          {/* Discount Type & Value Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Discount Type</label>
              </div>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Discount Value</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={form.type === "PERCENT" ? "e.g., 15" : "e.g., 50"}
                  value={form.value}
                  onChange={(e) => update("value", e.target.value)}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {form.type === "PERCENT" ? "%" : "$"}
                </div>
              </div>
            </div>
          </div>

          {/* Target Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">Apply To</label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "PRODUCT", label: "Product", icon: Package },
                { value: "CATEGORY", label: "Category", icon: Tag },
                { value: "BRANCH", label: "Branch", icon: Globe },
                // { value: "BILL", label: "Bill", icon: CreditCard },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        targetType: option.value,
                        targetId: null,
                        targetLabel: "",
                      })
                    }
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                      form.targetType === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${
                      form.targetType === option.value ? "text-blue-600" : "text-gray-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      form.targetType === option.value ? "text-blue-700" : "text-gray-600"
                    }`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <TargetSearch
                targetType={form.targetType}
                onSelect={(item) =>
                  setForm({
                    ...form,
                    targetId: item._id,
                    targetLabel: item.name || item.code,
                  })
                }
              />
              
              {form.targetLabel && (
                <div className="px-4 py-3 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Selected Target</p>
                      <p className="font-semibold text-gray-900">{form.targetLabel}</p>
                    </div>
                    <button
                      onClick={() => update("targetId", null)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">Validity Period</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Start Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                  <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {!form.isLifetime && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={form.endDate}
                      onChange={(e) => update("endDate", e.target.value)}
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <input
                type="checkbox"
                id="lifetime"
                checked={form.isLifetime}
                onChange={(e) => update("isLifetime", e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <label htmlFor="lifetime" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Set as Lifetime Discount
                </label>
              </div>
              <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-1 rounded-full">No expiration</span>
            </div> */}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium py-3.5 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Discount...
                  </div>
                ) : (
                  "Create Discount Campaign"
                )}
              </button>
              
              <button
                onClick={reset}
                type="button"
                className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Discounts will be automatically applied based on the selected criteria
          </p>
        </div>
      </div>
    </div>
  );
}
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { toast } from "sonner";

export default function StatusChangeModal({
  isOpen,
  onClose,
  data,
  api,
  css = "",
  onSuccess,
}) {
  const { axiosSecure } = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  
  // সেফটি ফলব্যাক টাইপ এভ্যালুয়েশন
  const currentStatus = data?.status === "active" || data?.status === true;
  const newStatus = !currentStatus;

  const handleStatusChange = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // ইআরপি স্ট্যান্ডার্ড স্ট্রিং ভ্যালু কনভার্সন
      const statusPayload = newStatus ? "active" : "inactive";
      
      const res = await axiosSecure.post(api, { status: statusPayload });
      
      if (res.status === 200 || res.data?.success) {
        toast.success(
          `${data?.name || "Item"} status updated to ${statusPayload.toUpperCase()}`
        );
        onSuccess && onSuccess(data);
        onClose(false);
      } else {
        toast.error(res?.data?.message || "Failed to update item status registry.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "System execution failure occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const disableKeys = (e) => {
      // Escape এবং এন্টার এর স্বাভাবিক মেকানিজম বাদে অন্য কি ব্লক রাখার জন্য
      if (e.key !== "Escape" && e.key !== "Enter") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    if (isOpen) window.addEventListener("keydown", disableKeys, true);
    return () => window.removeEventListener("keydown", disableKeys, true);
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !loading && onClose(false)}>
        {/* Backdrop overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
        </Transition.Child>

        {/* Center viewport matrix container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-xl transform overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-2xl p-8 text-left transition-all ${css}`}
              >
                {/* Upper Status Header Tracker */}
                <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                    <AlertCircle size={28} />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold text-slate-900 tracking-tight"
                    >
                      Confirm Lifecycle State Modification
                    </Dialog.Title>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Operational Ledger Identity Action Trigger
                    </p>
                  </div>
                </div>

                {/* Core Context Content Panel */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Target Resource Name
                  </div>
                  <div className="text-lg font-bold text-slate-800 tracking-tight mb-4">
                    {data?.name || "Unspecified Ledger Entity Asset"}
                  </div>

                  {/* Visual State Transition Flow Matrix Layout */}
                  <div className="flex items-center gap-6 mt-2 pt-2 border-t border-slate-200/60">
                    <div className="flex-1">
                      <span className="block text-xs font-medium text-slate-400 mb-1">
                        Current Registry State
                      </span>
                      <span
                        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          currentStatus
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {currentStatus ? "Active Ledger" : "Inactive State"}
                      </span>
                    </div>

                    <div className="text-slate-400 pt-4 animate-pulse">
                      <ArrowRight size={20} />
                    </div>

                    <div className="flex-1">
                      <span className="block text-xs font-medium text-slate-400 mb-1">
                        Proposed Next State
                      </span>
                      <span
                        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          newStatus
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-500/10"
                            : "bg-rose-50 text-rose-700 border border-rose-300 ring-2 ring-rose-500/10"
                        }`}
                      >
                        {newStatus ? "Active Ledger" : "Inactive State"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Warning Info Label */}
                <p className="text-xs text-slate-500 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/40 mb-6">
                  💡 <strong>Notice:</strong> Changing this product lifecycle state will directly affect item availability inside POS billing catalogs, stock valuation records, and real-time inventory management dashboards immediately.
                </p>

                {/* Lower Action Layout Button Control Nodes */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="secondary"
                    disabled={loading}
                    onClick={() => onClose(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700 border-0 transition-all duration-200"
                  >
                    Abort Action
                  </Button>

                  <Button
                    onClick={handleStatusChange}
                    disabled={loading}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all duration-200 ${
                      newStatus 
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10" 
                        : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
                    } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Committing State Change...
                      </span>
                    ) : (
                      "Apply State Update"
                    )}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
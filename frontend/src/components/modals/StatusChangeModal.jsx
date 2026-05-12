import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
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
  const currentStatus = data?.is_active ?? false; // ✅ use is_active from data
  const newStatus = !currentStatus; // ✅ toggle the boolean

  const handleStatusChange = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // ✅ send the correct body
      const res = await axiosSecure.post(api, { is_active: newStatus });
      if (res.status === 200) {
        toast.success(
          `${data?.name || "Item"} status changed to ${
            newStatus ? "Active" : "Inactive"
          }`
        );
        onSuccess && onSuccess(data);
        onClose(false);
      } else {
        toast.error(res?.data?.message || "Failed to change status");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const disableKeys = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    if (isOpen) window.addEventListener("keydown", disableKeys, true);
    return () => window.removeEventListener("keydown", disableKeys, true);
  }, [isOpen]);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Center modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel
                className={`w-full max-w-sm transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl p-6 text-center transition-all ${css}`}
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full animate-pulse">
                    <RefreshCcw
                      size={42}
                      className="text-blue-600 animate-spin-slow"
                    />
                  </div>
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  Change Status
                </Dialog.Title>

                {/* Message */}
                <p className="text-sm text-gray-600 mb-6">
                  Current status of{" "}
                  <span className="font-semibold text-gray-800">
                    {data?.name || "this item"}
                  </span>{" "}
                  is{" "}
                  <span
                    className={`font-semibold ${
                      currentStatus ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {currentStatus ? "Active" : "Inactive"}
                  </span>
                  . <br />
                  Do you want to change it to{" "}
                  <span
                    className={`font-semibold ${
                      newStatus ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {newStatus ? "Active" : "Inactive"}
                  </span>
                  ?
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    disabled={loading}
                    onClick={() => onClose(false)}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleStatusChange}
                    disabled={loading}
                    className={`btn-gradient ${
                      loading ? "opacity-80 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Changing...
                      </>
                    ) : (
                      "Make Change"
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

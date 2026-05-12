// DeleteModal.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { toast } from "sonner";

export default function DeleteModal({
  isOpen,
  onClose,
  data,
  api,
  message,
  css = "",
  onSuccess,
}) {
  const {axiosSecure} = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  // DELETE handler
  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axiosSecure.delete(`${api}`);
      if (res.status === 200) {
        toast.success(`${data?.name || "Item"} deleted successfully`);
        onSuccess && onSuccess(data);
        onClose(false);
      } else {
        toast.error(res?.data?.message || "Failed to delete");
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
    <Transition  appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        // ❌ disable outside click close
        onClose={() => {}}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
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
              leaveTo="opacity-0 scale-90">
              <Dialog.Panel
                className={`w-full max-w-sm transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl p-6 text-center transition-all ${css}`}>
                {/* Delete Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-100 rounded-full animate-pulse">
                    <AlertTriangle
                      size={42}
                      className="text-red-600 animate-bounce"
                    />
                  </div>
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Confirmation
                </Dialog.Title>

                {/* Message */}
                <p className="text-sm text-gray-600 mb-6">
                  {message ||
                    `You are going to delete "${
                      data?.name || "this item"
                    }". Are you sure?`}
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    disabled={loading}
                    onClick={() => onClose(false)}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
                    No, Keep it
                  </Button>

                  <Button
                    onClick={handleDelete}
                    disabled={loading}
                    className={`btn-danger ${
                      loading ? "opacity-80 cursor-not-allowed" : ""
                    }`}>
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete"
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

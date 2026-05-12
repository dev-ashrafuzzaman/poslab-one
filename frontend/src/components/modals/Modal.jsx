import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({
  isOpen,
  setIsOpen,
  title,
  subTitle = "",
  children,
  size = "md", // sm | md | lg | xl | full
  icon = "",
  closeOnEsc = true,
  showCloseButton = true,
  footer = null,
  overlayBlur = true,
  overlayOpacity = 30,
  padding = "p-6",
  rounded = "xl", // sm | md | lg | xl | 2xl
  shadow = "xl", // sm | md | lg | xl | 2xl
}) {
  // Close on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && closeOnEsc && setIsOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, closeOnEsc, setIsOpen]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-[calc(100vw-2rem)]",
  }[size];

  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  }[rounded];

  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
  }[shadow];

  const handleClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Backdrop/Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`,
              backdropFilter: overlayBlur ? "blur(4px)" : "none",
            }}
          />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel
                onClick={(e) => e.stopPropagation()}
                className={`w-full transform bg-white ${roundedClasses} ${shadowClasses} transition-all ${sizeClasses} mx-auto`}>
                {/* Header */}
                {(title || subTitle || icon || showCloseButton) && (
                  <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
                    {/* Left: Icon + Title */}
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      {icon && (
                        <div className="mt-0.5 text-gray-500">{icon}</div>
                      )}

                      {/* Title + Subtitle */}
                      <div>
                        {title && (
                          <Dialog.Title className="text-lg font-semibold text-gray-900 leading-tight">
                            {title}
                          </Dialog.Title>
                        )}

                        {subTitle && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {subTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Close button */}
                    {showCloseButton && (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Body */}
                <div className={padding}>{children}</div>

                {/* Footer (optional) */}
                {footer && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

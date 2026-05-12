import React, { useState } from "react";
import { createPortal } from "react-dom";
import DeleteModal from "../modals/DeleteModal";
import StatusChangeModal from "../modals/StatusChangeModal";

export default function TableActions({ actions = [], row, onSuccess }) {
  const [activeModal, setActiveModal] = useState(null); // "delete" | "status" | null
  const [modalPayload, setModalPayload] = useState(null);

  const handleAction = (action, row) => {
    // ✅ Build API dynamically from action.getApi if available
    const api =
      typeof action.getApi === "function"
        ? action.getApi(row)
        : action.api || null;

    if (action.type === "delete") {
      setModalPayload({ ...row, api });
      setActiveModal("delete");
    } else if (action.type === "status") {
      setModalPayload({ ...row, api });
      setActiveModal("status");
    } else if (typeof action.onClick === "function") {
      action.onClick(row);
    }
    
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  return (
    <>
      {/* Action Buttons */}
      <td className="px-4 py-3 flex justify-center items-center gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleAction(action, row)}
            className={`p-2 rounded-md hover:bg-gray-100 ${action.className || ""}`}
          >
            {action.icon} {action.label}
          </button>
        ))}
      </td>

      {/* ✅ Modals rendered via Portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {activeModal === "delete" && (
              <DeleteModal
                isOpen={true}
                onClose={closeModal}
                data={modalPayload}
                api={modalPayload?.api}
                onSuccess={onSuccess}
              />
            )}
            {activeModal === "status" && (
              <StatusChangeModal
                isOpen={true}
                onClose={closeModal}
                data={modalPayload}
                api={modalPayload?.api}
                onSuccess={onSuccess}
              />
            )}
          </>,
          document.body
        )}
    </>
  );
}

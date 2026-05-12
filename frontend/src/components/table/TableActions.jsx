import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, RefreshCcw } from "lucide-react";
import DeleteModal from "../modals/DeleteModal";
import StatusChangeModal from "../modals/StatusChangeModal";

export default function TableActions({ row, actions = [], onSuccess }) {
  const navigate = useNavigate();

  const [deleteState, setDeleteState] = useState(null);
  const [statusState, setStatusState] = useState(null);

  const resolveApi = (action) =>
    typeof action.api === "function" ? action.api(row) : action.api;

  const handleAction = (action) => {
    // 🔥 Built-in system actions
    if (action.type === "delete") {
      setDeleteState({
        data: row,
        api: resolveApi(action),
        message: action.message,
      });
      return;
    }

    if (action.type === "status") {
      setStatusState({
        data: row,
        api: resolveApi(action),
      });
      return;
    }

    if (action.type === "view") {
      if (action.onClick) {
        action.onClick(row);
      } else {
        navigate(`${row._id}`);
      }
      return;
    }

    if (action.type === "edit") {
      navigate(`${row._id}/edit`);
      return;
    }

    // 🔥 UNIVERSAL HANDLER (pay, custom, anything)
    if (typeof action.onClick === "function") {
      action.onClick(row);
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        {actions.map((action, i) => {
          if (action.hidden?.(row)) return null;

          return (
            <button
              key={i}
              type="button"
              title={action.label}
              onClick={(e) => {
                e.stopPropagation(); // safety
                handleAction(action);
              }}
              className={`action ${action.type}`}
            >
              {action.type === "view" && <Eye size={14} />}
              {action.type === "edit" && <Pencil size={14} />}
              {action.type === "delete" && <Trash2 size={14} />}
              {action.type === "status" && <RefreshCcw size={14} />}
              {action.icon}
            </button>
          );
        })}
      </div>

      {/* Delete Modal */}
      {deleteState && (
        <DeleteModal
          isOpen
          data={deleteState.data}
          api={deleteState.api}
          message={deleteState.message}
          onClose={() => setDeleteState(null)}
          onSuccess={() => {
            setDeleteState(null);
            onSuccess?.();
          }}
        />
      )}

      {/* Status Modal */}
      {statusState && (
        <StatusChangeModal
          isOpen
          data={statusState.data}
          api={statusState.api}
          onClose={() => setStatusState(null)}
          onSuccess={() => {
            setStatusState(null);
            onSuccess?.();
          }}
        />
      )}
    </>
  );
}
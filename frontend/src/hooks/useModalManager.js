import { useState, useCallback } from "react";

/**
 * Reusable modal manager hook
 */
export default function useModalManager() {
  const [modals, setModals] = useState({});

  // Open a modal with optional payload
  const openModal = useCallback((name, payload = null) => {
    setModals((prev) => ({
      ...prev,
      [name]: { isOpen: true, payload },
    }));
  }, []);

  // Close a modal
  const closeModal = useCallback((name) => {
    setModals((prev) => ({
      ...prev,
      [name]: { ...prev[name], isOpen: false, payload: null },
    }));
  }, []);

  return { modals, openModal, closeModal };
}

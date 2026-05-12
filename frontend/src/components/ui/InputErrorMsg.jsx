// src/components/ui/InputErrorMsg.jsx
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const InputErrorMsg = ({ when, children }) => {
  return (
    <AnimatePresence>
      {when && (
        <motion.div
          key="input-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-1 mt-1 text-xs font-medium text-red-500"
        >
          <AlertCircle size={14} className="mt-[2px]" />
          <span>{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InputErrorMsg;

import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ 
  open, 
  onClose, 
  children, 
  className = "",
  showCloseButton = true,
  closeOnBackdrop = true 
}) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={onClose} className="relative z-50">
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={closeOnBackdrop ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 ${className}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {children}
            </motion.div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
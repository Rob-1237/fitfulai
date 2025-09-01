import Modal from "../ui/Modal";

export default function SignOutModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Sign Out?
        </h2>
        
        <p className="text-sm text-gray-600">
          Are you sure you want to sign out of your account?
        </p>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </Modal>
  );
}
import { useState } from "react";
import { useProfileStore } from "../../stores/useProfileStore";
import { useToast } from "../ui/ToastProvider";
import Modal from "../ui/Modal";

export default function EditProfileModal({ open, onClose, profile }) {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateBasicInfo } = useProfileStore();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    if (!email.trim()) {
      addToast('Email is required', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await updateBasicInfo({
        name: name.trim(),
        email: email.trim()
      });

      if (success) {
        addToast('Profile updated successfully!', 'success');
        onClose();
      } else {
        addToast('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(profile?.name || '');
    setEmail(profile?.email || '');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl text-black text-left font-semibold">
          Edit Profile
        </h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          placeholder="Name"
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          placeholder="Email"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>

        <div className="flex justify-center text-md">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-md bg-red-600 py-2 text-white hover:bg-red-700">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
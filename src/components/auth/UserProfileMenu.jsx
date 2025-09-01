// @src/components/auth/UserProfileMenu.jsx
import { Menu } from "@headlessui/react";
import { useAuth } from "../../hooks/useAuth";

export function UserProfileMenu({ profile }) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 rounded-full bg-gray-100 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
          {profile.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium">{profile.name}</span>
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5">
        <Menu.Item>
          <span className="block px-4 py-2 text-sm text-gray-500">{profile.email}</span>
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={handleSignOut}
              className={`w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100' : ''}`}
            >
              Sign Out
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
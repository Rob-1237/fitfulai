import { Menu } from "@headlessui/react";
import { useAuth } from "../../hooks/useAuth";

export default function UserProfileCircle({ profile }) {
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                {/* Handle missing profile image gracefully */}
                {profile.image ? (
                    <img
                        src={profile.image}
                        alt="Profile"
                        className="h-10 w-10 rounded-full border"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5">
                <Menu.Item>
                    {() => (
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="font-semibold text-gray-800">{profile.name || 'User'}</p>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                        </div>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                        <button
                            className={`w-full px-4 py-2 text-left text-sm text-red-600 ${active ? 'bg-gray-100' : ''
                                }`}
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>
                    )}
                </Menu.Item>
            </Menu.Items>
        </Menu>
    );
}

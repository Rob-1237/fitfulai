import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import SettingsModal from "./SettingsModal";
import EditProfileModal from "./EditProfileModal";
import SignOutModal from "./SignOutModal";

export default function UserProfileCircle({ profile }) {
    const { signOut } = useAuth();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [signOutOpen, setSignOutOpen] = useState(false);

    const handleSignOut = async () => {
        const result = await signOut();
        if (result.success) {
            setSignOutOpen(false);
        }
    };

    return (
        <Menu>
            <MenuButton className="flex items-center space-x-2 rounded-full bg-gray-100 hover:bg-gray-200">
                {/* Handle missing profile image gracefully */}
                {profile.image ? (
                    <img
                        src={profile.image}
                        alt="Profile"
                        className="h-10 w-10 rounded-full border"
                    />
                ) : (
                    <div className="h-11 w-11 rounded-full bg-[var(--color-orange)] hover:bg-[var(--color-red)] flex items-center justify-center text-xl text-white font-semibold">
                        {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
            </MenuButton>

            <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                {/* User Name (non-clickable) */}
                <MenuItem>
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{profile?.name || 'User'}</p>
                    </div>
                </MenuItem>
                
                {/* Settings */}
                <MenuItem>
                    {({ focus }) => (
                        <button
                            className={`w-full px-4 py-2 text-left text-sm text-[var(--color-dk-gray)] hover:text-[var(--color-md-gray)] ${focus ? 'bg-gray-100' : ''}`}
                            onClick={() => setSettingsOpen(true)}
                        >
                            Settings
                        </button>
                    )}
                </MenuItem>
                
                {/* Edit */}
                <MenuItem>
                    {({ focus }) => (
                        <button
                            className={`w-full px-4 py-2 text-left text-sm text-[var(--color-dk-gray)] hover:text-[var(--color-md-gray)] ${focus ? 'bg-gray-100' : ''}`}
                            onClick={() => setEditProfileOpen(true)}
                        >
                            Edit
                        </button>
                    )}
                </MenuItem>
                
                {/* Sign Out */}
                <MenuItem>
                    {({ focus }) => (
                        <button
                            className={`w-full px-4 py-2 text-left rounded-md text-sm text-[var(--color-dk-gray)] hover:text-[var(--color-md-gray)] ${focus ? 'bg-gray-100' : ''}`}
                            onClick={() => setSignOutOpen(true)}
                        >
                            Sign Out
                        </button>
                    )}
                </MenuItem>
            </MenuItems>
            
            {/* Modals */}
            {settingsOpen && (
                <SettingsModal 
                    open={settingsOpen} 
                    onClose={() => setSettingsOpen(false)} 
                />
            )}
            {editProfileOpen && (
                <EditProfileModal 
                    open={editProfileOpen} 
                    onClose={() => setEditProfileOpen(false)}
                    profile={profile}
                />
            )}
            {signOutOpen && (
                <SignOutModal 
                    open={signOutOpen} 
                    onClose={() => setSignOutOpen(false)}
                    onConfirm={handleSignOut}
                />
            )}
        </Menu>
    );
}

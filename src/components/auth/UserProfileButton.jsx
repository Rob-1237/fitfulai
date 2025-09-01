import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth"; // custom hook for supabase auth session
import UserProfileCircle from "./UserProfileCircle";
import AuthModal from "./AuthModal";

export default function UserProfileButton() {
  const { profile, isInitialized } = useAuth(); // profile from supabase
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!isInitialized) return null; // Show loading while initializing
  // console.log('isInitialized: ', isInitialized);

  return (
    <div className="fixed top-4 right-30 z-50">
    {profile ? (
      <UserProfileCircle profile={profile} />
    ) : (
      <>
        <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
        {authModalOpen && (
          <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        )}
      </>
    )}
  </div>
  );
}

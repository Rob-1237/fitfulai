import { useState, useEffect } from "react";
import { useUIStore } from "../../stores/useUIStore";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth"; // custom hook for supabase auth session
import UserProfileCircle from "./UserProfileCircle";
import AuthModal from "./AuthModal";

export default function UserProfileButton() {
  const { profile, isInitialized, getCurrentUser } = useAuth(); // profile from supabase
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { isMobile } = useUIStore();

  // Get current authenticated user for testing
  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    if (isInitialized) {
      checkUser();
    }
  }, [isInitialized, getCurrentUser]);

  if (!isInitialized) return null; // Show loading while initializing

  // Temporary fix: if user is authenticated but no profile, show profile circle with user data
  const displayProfile = profile || (currentUser && {
    name: currentUser.user_metadata?.name || 'User',
    email: currentUser.email
  });

  return (
    <div className={`fixed top-4 ${isMobile ? 'right-4' : 'right-24'} z-50`}>
      {displayProfile ? (
        <UserProfileCircle profile={displayProfile} />
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

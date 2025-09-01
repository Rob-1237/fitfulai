// @src/components/auth/AuthButton.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { UserProfileMenu } from "./UserProfileMenu";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import AuthModal from "./AuthModal";
import { Button } from "../ui/Button";

export function AuthButton() {
  const [showModal, setShowModal] = useState(false);
  const { profile, isInitialized } = useAuth();

  // Show loading during initialization
  if (!isInitialized) {
    return <LoadingSpinner size="sm" />;
  }

  // Show user menu if authenticated
  if (profile) {
    return <UserProfileMenu profile={profile} />;
  }

  // Show sign in button if not authenticated
  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Sign In
      </Button>
      <AuthModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

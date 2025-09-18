import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./components/ui/ToastProvider";
import AuthModal from "./components/auth/AuthModal";
import "./styles/App.css";

function App() {
  const { user, isInitialized, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">FitfulAI Firebase Test</h1>

          {user ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">✅ Authenticated!</p>
                <p className="text-sm text-green-600 mt-1">
                  Email: {user.email}
                </p>
                <p className="text-sm text-green-600">
                  UID: {user.uid}
                </p>
              </div>

              <button
                onClick={signOut}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Please sign in to test Firebase authentication</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}
        </div>

        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
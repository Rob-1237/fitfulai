 // @src/components/auth/AuthGuard.jsx
 import { useAuth } from "../../hooks/useAuth";
 import { LoadingSpinner } from "../ui/LoadingSpinner";

 export function AuthGuard({ children, fallback = null, requireAuth = false }) {
   const { profile, isInitialized } = useAuth();

   // Show loading while initializing
   if (!isInitialized) {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <LoadingSpinner size="lg" />
       </div>
     );
   }

   // If auth required but not authenticated
   if (requireAuth && !profile) {
     return fallback || <div>Please sign in to continue.</div>;
   }

   return children;
 }

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../ui/ToastProvider";
import type { AuthMode } from "./AuthModal";

interface SimpleAuthFormProps {
    mode: AuthMode;
    setMode: (mode: AuthMode) => void;
    onClose: () => void;
}

export default function SimpleAuthForm({ mode, setMode, onClose }: SimpleAuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const { signUp, signIn, resetPassword, signInWithGoogle } = useAuth();
    const { addToast } = useToast();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Basic validation
            if (!email || !email.includes('@')) {
                console.warn('⚠️ Validation failed: Invalid email');
                throw new Error('Please enter a valid email address');
            }

            if (mode === "signin") {
                if (!password) {
                    throw new Error('Password is required');
                }

                const { success, error } = await signIn(email, password);

                if (!success) throw new Error(error || 'Sign in failed');
                addToast("Welcome back!", "success");
                onClose();
            }

            if (mode === "signup") {
                if (!password) {
                    throw new Error('Password is required');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
                if (!name || name.trim().length < 2) {
                    throw new Error('Name must be at least 2 characters');
                }

                const { success, error } = await signUp(email, password, name);

                if (!success) throw new Error(error || 'Sign up failed');
                addToast("Account created successfully!", "success");
                onClose();
            }

            if (mode === "forgot") {
                const { success, error } = await resetPassword(email);

                if (!success) throw new Error(error || 'Password reset failed');
                addToast("Password reset email sent!", "success");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('❌ Form submission error:', message);
            addToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const { success, error } = await signInWithGoogle();
            if (!success) throw new Error(error || 'Google sign-in failed');
            addToast("Signed in with Google!", "success");
            onClose();
        } catch (err) {
            addToast(err instanceof Error ? err.message : String(err), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-black text-left font-semibold">
                {mode === "signin" && "Sign In"}
                {mode === "signup" && "Create Account"}
                {mode === "forgot" && "Reset Password"}
            </h2>

            {mode === "signup" && (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Name"
                    required
                />
            )}

            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Email"
                required
            />

            {mode !== "forgot" && (
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Password"
                    required
                />
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
            >
                {loading ? "Loading..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
            </button>

            {mode !== "forgot" && (
                <>
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full rounded-md border border-gray-300 py-2 px-4 text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </>
            )}

            <div className="flex justify-between text-sm">
                {mode === "signin" && (
                    <>
                        <button type="button" onClick={() => setMode("signup")} className="text-blue-600">
                            Create Account
                        </button>
                        <button type="button" onClick={() => setMode("forgot")} className="text-blue-600">
                            Forgot Password?
                        </button>
                    </>
                )}
                {mode !== "signin" && (
                    <button type="button" onClick={() => setMode("signin")} className="text-blue-600">
                        Back to Sign In
                    </button>
                )}
            </div>
        </form>
    );
}
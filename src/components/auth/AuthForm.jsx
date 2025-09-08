import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../ui/ToastProvider";

export default function AuthForm({ mode, setMode, onClose }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const { signUp, signIn, resetPassword } = useAuth();
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            if (mode === "signin") {
                const { success, error } = await signIn(email, password);
                if (!success) throw new Error(error);
                addToast("Welcome back!", "success");
                onClose();
            }
            if (mode === "signup") {
                const { success, error } = await signUp(email, password, name);
                if (!success) throw new Error(error);
                setMessage("Account created! Check your email for a confirmation link.");
            }
            if (mode === "forgot") {
                const { success, error } = await resetPassword(email);
                if (!success) throw new Error(error);
                setMessage("Password reset link sent.");
            }
        } catch (err) {
            addToast(err.message, "error");
            setMessage(err.message);
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

            {message && <p className="text-sm text-red-500">{message}</p>}

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

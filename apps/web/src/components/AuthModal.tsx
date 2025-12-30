"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
            },
        });
        setLoading(false);
        if (error) {
            alert(error.message);
        } else {
            setSent(true);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] bg-white/90 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-sm bg-white shadow-2xl rounded-2xl border border-gray-100 p-8"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-medium tracking-tight text-gray-900">Sign In</h2>
                            <button
                                onClick={onClose}
                                className="p-1 text-gray-400 hover:text-gray-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {sent ? (
                            <div className="text-center py-8">
                                <p className="text-lg font-medium text-gray-800 mb-2">Check your email</p>
                                <p className="text-sm text-gray-500">
                                    We sent a magic link to <span className="font-bold">{email}</span>.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 w-full bg-gray-100 text-gray-800 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="kotodama@example.com"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-gray-200 outline-none placeholder:text-gray-300"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? "Sending..." : "Send Magic Link"}
                                        {!loading && <LogIn size={16} />}
                                    </button>
                                </div>

                                <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
                                    By signing in, you agree to allow Kotodama to save your Persona DNA and drafts.
                                </p>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

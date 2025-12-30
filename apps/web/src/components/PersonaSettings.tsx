"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2, Save, User as UserIcon } from "lucide-react";
import { useUser, PersonaDNA } from "../store/userContext";
import AuthModal from "./AuthModal";

export default function PersonaSettings() {
    const { persona, setPersona, user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [localPersona, setLocalPersona] = useState<PersonaDNA>(persona);

    const handleSave = () => {
        setPersona(localPersona);
        setIsOpen(false);
    };

    const handleChange = (field: keyof PersonaDNA, value: string | string[]) => {
        setLocalPersona((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            {/* Trigger Button */}
            <button
                onClick={() => {
                    setLocalPersona(persona);
                    setIsOpen(true);
                }}
                className="fixed top-6 right-6 z-40 p-2 text-gray-300 hover:text-gray-600 transition-colors"
            >
                <Settings2 size={20} strokeWidth={1.5} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-white shadow-2xl rounded-2xl border border-gray-100 p-6 md:p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-medium tracking-tight text-gray-900">Persona DNA</h2>
                                    {user ? (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-[10px] text-gray-500 font-medium truncate max-w-[100px]">{user.email}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsAuthOpen(true)}
                                            className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-1"
                                        >
                                            <UserIcon size={12} />
                                            Sign In / Sync
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={localPersona.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-gray-200 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={localPersona.role}
                                        onChange={(e) => handleChange("role", e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-gray-200 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Traits (Comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={localPersona.traits.join(", ")}
                                        onChange={(e) =>
                                            handleChange(
                                                "traits",
                                                e.target.value.split(",").map((s) => s.trim())
                                            )
                                        }
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-gray-200 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Portfolio / Context
                                    </label>
                                    <textarea
                                        value={localPersona.portfolioContext}
                                        onChange={(e) => handleChange("portfolioContext", e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-gray-200 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Save DNA
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

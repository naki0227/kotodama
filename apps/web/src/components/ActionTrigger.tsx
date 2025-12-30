"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUser } from "../store/userContext";
import { humanizeText } from "../lib/gemini";
import clsx from "clsx";

export default function ActionTrigger() {
    const { text, setText, persona, isHumanizing, setIsHumanizing } = useUser();
    const show = text.length > 0;

    const handleHumanize = async () => {
        if (isHumanizing) return;
        setIsHumanizing(true);
        const newText = await humanizeText(text, JSON.stringify(persona));
        setText(newText);
        setIsHumanizing(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed bottom-8 right-6 z-50 flex flex-col gap-4 items-end">
                    {/* Stealth Button (Secondary) */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                            if (isHumanizing) return;
                            setIsHumanizing(true);
                            // Import dynamically or pass via prop if needed, but here simple import work
                            // Note: ActionTrigger needs to import stealthRewrite
                            const { stealthRewrite } = await import("../lib/gemini");
                            const newText = await stealthRewrite(text);
                            setText(newText);
                            setIsHumanizing(false);
                        }}
                        disabled={isHumanizing}
                        className={clsx(
                            "p-3 rounded-full shadow-md transition-colors border border-black/5 bg-white hover:bg-gray-50 text-gray-400 hover:text-purple-600",
                            isHumanizing && "opacity-50 cursor-not-allowed"
                        )}
                        title="Stealth / Anti-AI"
                    >
                        {/* Ghost Icon for Stealth */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 10h.01" />
                            <path d="M15 10h.01" />
                            <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
                        </svg>
                    </motion.button>

                    {/* Main Humanize Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleHumanize}
                        disabled={isHumanizing}
                        className={clsx(
                            "p-4 rounded-full shadow-lg transition-colors border border-black/5",
                            isHumanizing ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50 active:bg-gray-100"
                        )}
                    >
                        <motion.div
                            animate={isHumanizing ? { rotate: 360 } : { rotate: 0 }}
                            transition={isHumanizing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                        >
                            <Sparkles
                                className={clsx(
                                    "w-6 h-6",
                                    isHumanizing ? "text-gray-400" : "text-amber-500"
                                )}
                                strokeWidth={1.5}
                            />
                        </motion.div>
                    </motion.button>
                </div>
            )}
        </AnimatePresence>
    );
}

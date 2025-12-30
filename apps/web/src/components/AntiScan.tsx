"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Copy, Check, Info } from "lucide-react";
import { useUser } from "../store/userContext";

const ZERO_WIDTH_CHARS = [
    "\u200B", // Zero Width Space
    "\u200C", // Zero Width Non-Joiner
    "\u200D", // Zero Width Joiner
    "\u2060", // Word Joiner
];

export default function AntiScan() {
    const { text } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [protectedText, setProtectedText] = useState("");
    const [copied, setCopied] = useState(false);
    const [noiseLevel, setNoiseLevel] = useState<"low" | "high">("high");

    const injectNoise = () => {
        if (!text) return;

        let result = "";
        const chars = text.split("");
        const frequency = noiseLevel === "high" ? 0.7 : 0.3; // 70% or 30% chance per char

        chars.forEach((char) => {
            result += char;
            if (Math.random() < frequency) {
                const noise = ZERO_WIDTH_CHARS[Math.floor(Math.random() * ZERO_WIDTH_CHARS.length)];
                result += noise;
            }
        });

        setProtectedText(result);
    };

    const handleOpen = () => {
        setIsOpen(true);
        injectNoise();
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(protectedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Trigger Button (Next to RiskChecker) */}
            <div className="relative group">
                <button
                    onClick={handleOpen}
                    disabled={!text}
                    className="p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Anti-Scan Protection"
                >
                    <ShieldAlert size={24} strokeWidth={1.5} />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Anti-Scan
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 pb-48"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 w-full max-w-lg max-h-[70vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-2">
                                    <ShieldAlert size={20} className="text-red-600" /> Anti-Scan Protection
                                </h2>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <Info size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Injects invisible "zero-width" characters into your text.
                                            This disrupts AI scrapers and crawlers without affecting readability for humans.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Protection Level</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setNoiseLevel("low"); setTimeout(injectNoise, 0); }}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${noiseLevel === "low" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}
                                        >
                                            Low (Light Noise)
                                        </button>
                                        <button
                                            onClick={() => { setNoiseLevel("high"); setTimeout(injectNoise, 0); }}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${noiseLevel === "high" ? "bg-red-100 text-red-700 border border-red-200" : "bg-gray-100 text-gray-500"}`}
                                        >
                                            High (Heavy Noise)
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Preview (Looks normal, but is protected)</label>
                                    <div className="h-32 p-4 bg-white border border-gray-200 rounded-xl overflow-y-auto text-gray-800 text-sm font-mono leading-relaxed select-all">
                                        {protectedText || "Generating protection..."}
                                    </div>
                                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-300">
                                        {protectedText.length} chars (Original: {text?.length})
                                    </div>
                                </div>

                                <button
                                    onClick={handleCopy}
                                    className="w-full bg-black text-white px-6 py-4 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? "Copied Protected Text!" : "Copy Protected Text"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

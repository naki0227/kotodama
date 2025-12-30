"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, X, Copy, Check } from "lucide-react";
import { useUser } from "../store/userContext";
import { optimizeForPlatform, PlatformResult } from "../lib/gemini";
import clsx from "clsx";

const PLATFORMS = ["Zenn", "Qiita", "Note", "Twitter"] as const;
type Platform = typeof PLATFORMS[number];

export default function SmartPublisher() {
    const { text } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [activePlatform, setActivePlatform] = useState<Platform>("Zenn");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PlatformResult | null>(null);
    const [copied, setCopied] = useState(false);

    const [resultsCache, setResultsCache] = useState<Record<string, PlatformResult>>({});

    const handleOpen = () => {
        setIsOpen(true);
        handleOptimize(activePlatform);
    };

    const handleOptimize = async (platform: Platform, force = false) => {
        if (!text) return;
        setActivePlatform(platform);

        // check cache
        if (!force && resultsCache[platform]) {
            setResult(resultsCache[platform]);
            return;
        }

        setLoading(true);
        const res = await optimizeForPlatform(text, platform);
        setResult(res);
        setResultsCache(prev => ({ ...prev, [platform]: res }));
        setLoading(false);
    };

    const handleCopy = async () => {
        if (!result) return;
        const copyText = activePlatform === "Twitter"
            ? result.content
            : `Title: ${result.title}\n\nTags: ${result.tags.join(" ")}\n\n${result.content}`;

        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Trigger Button (Top Right, near Settings) */}
            <button
                onClick={handleOpen}
                disabled={!text}
                className="fixed top-6 right-20 z-40 p-2 text-gray-300 hover:text-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Smart Publisher"
            >
                <Share size={20} strokeWidth={1.5} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 w-full max-w-2xl h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-2">
                                    <Share size={20} /> Smart Publisher
                                </h2>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1">
                                {PLATFORMS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => handleOptimize(p)}
                                        className={clsx(
                                            "px-4 py-2 rounded-t-lg transition-all relative text-sm font-medium",
                                            activePlatform === p ? "text-blue-600 bg-blue-50/50" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {p}
                                        {activePlatform === p && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto min-h-0 relative">
                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : result ? (
                                    <div className="space-y-6">
                                        {activePlatform !== "Twitter" && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Generated Title</label>
                                                <div className="mt-1 text-lg font-bold text-gray-800 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    {result.title}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                {activePlatform === "Twitter" ? "Tweet Draft" : "Summary / Description"}
                                            </label>
                                            <div className="mt-1 text-base text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                                                {result.content}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Tags</label>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {(result.tags || []).map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                                            💡 AI Logic: {result.explanation}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Select a platform to generate content
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => handleOptimize(activePlatform, true)}
                                    disabled={!text || loading}
                                    className="px-4 py-3 rounded-full text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                        <path d="M16 21h5v-5" />
                                    </svg>
                                    Regenerate
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={!result || loading}
                                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-gray-200"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? "Copied!" : "Copy to Clipboard"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

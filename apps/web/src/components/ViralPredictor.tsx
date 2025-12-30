"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, X, Sparkles, AlertCircle } from "lucide-react";
import { useUser } from "../store/userContext";
import { predictViralScore, ViralResult } from "../lib/gemini";

export default function ViralPredictor() {
    const { text } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ViralResult | null>(null);

    const handlePredict = async () => {
        if (!text) return;
        setLoading(true);
        const res = await predictViralScore(text);
        setResult(res);
        setLoading(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        handlePredict();
    };

    return (
        <>
            {/* Trigger Button (Top Right, Next to Smart Publisher) */}
            <button
                onClick={handleOpen}
                disabled={!text}
                className="fixed top-6 right-36 z-40 p-2 text-gray-300 hover:text-purple-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Viral Prediction"
            >
                <TrendingUp size={20} strokeWidth={1.5} />
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
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 w-full max-w-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-purple-500" /> Viral Prediction
                                </h2>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800">
                                    <X size={24} />
                                </button>
                            </div>

                            {loading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    <span className="text-xs font-medium tracking-wider">PREDICTING FUTURE...</span>
                                </div>
                            ) : result ? (
                                <div className="space-y-6">
                                    {/* Score Circle */}
                                    <div className="flex justify-center my-4">
                                        <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-purple-100">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-gray-900">{result.score}</div>
                                                <div className="text-xs text-gray-400 font-medium mt-1">VIRAL SCORE</div>
                                            </div>
                                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="46"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    className="text-transparent"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="46"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray="289"
                                                    strokeDashoffset={289 - (289 * result.score) / 100}
                                                    className="text-purple-500 transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Reach */}
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Reach</p>
                                        <p className="text-lg font-medium text-purple-900 bg-purple-50 px-4 py-2 rounded-full inline-block">
                                            🚀 {result.potentialReach}
                                        </p>
                                    </div>

                                    {/* Points */}
                                    <div className="grid grid-cols-1 gap-4 text-sm mt-4">
                                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                                <Sparkles size={14} /> Strong Points
                                            </h3>
                                            <ul className="space-y-1">
                                                {result.strongPoints.map((p, i) => (
                                                    <li key={i} className="text-green-700 font-medium">• {p}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                            <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                                <AlertCircle size={14} /> To Improve
                                            </h3>
                                            <ul className="space-y-1">
                                                {result.improvementPoints.map((p, i) => (
                                                    <li key={i} className="text-orange-700 font-medium">• {p}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                                    Click to analyze viral potential
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

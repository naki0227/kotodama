"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../store/userContext";
import { analyzeText } from "../lib/gemini";

export default function FloatingIndicator() {
    const { kotodamaRate, text, setAnalysis, analysis } = useUser();
    const show = text.length > 0;
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Debounced Analysis
    useEffect(() => {
        if (!text || text.length < 5) {
            setAnalysis(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsAnalyzing(true);
            const result = await analyzeText(text);
            setAnalysis(result);
            setIsAnalyzing(false);
        }, 1500); // Analyze after 1.5s of inactivity

        return () => clearTimeout(timer);
    }, [text, setAnalysis]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-[90%] flex justify-center"
                >
                    <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-gray-100 shadow-xl flex flex-col items-center gap-1 transition-all">

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                Kotodama
                            </span>
                            <div className="flex items-center gap-0.5">
                                <span className="text-xl font-light font-jp text-gray-900">
                                    {kotodamaRate}
                                </span>
                                <span className="text-xs text-gray-400 top-0.5 relative">%</span>
                            </div>

                            {/* Visual Bar inside */}
                            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden ml-1">
                                <motion.div
                                    className={`h-full ${isAnalyzing ? "bg-gray-300 animate-pulse" : "bg-gradient-to-r from-blue-400 to-purple-400"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${kotodamaRate}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Emotions / Advice ticker */}
                        <AnimatePresence mode="wait">
                            {analysis && !isAnalyzing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-col items-center gap-2 mt-1"
                                >
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {analysis.emotions.slice(0, 2).map((emo, i) => (
                                            <span key={i} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100">
                                                {emo.label}
                                            </span>
                                        ))}
                                    </div>
                                    {analysis.advice && (
                                        <p className="text-[10px] text-gray-400 text-center max-w-[200px] leading-relaxed">
                                            {analysis.advice}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

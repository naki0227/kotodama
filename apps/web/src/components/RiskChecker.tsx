"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useUser } from "../store/userContext";
import { analyzeRisk, RiskResult, fixRiskyText } from "../lib/gemini";

export default function RiskChecker() {
    const { text, setText } = useUser();
    const [status, setStatus] = useState<"idle" | "analyzing" | "result">("idle");
    const [result, setResult] = useState<RiskResult | null>(null);
    const [fixing, setFixing] = useState(false);

    const handleCheck = async () => {
        if (!text) return;
        setStatus("analyzing");
        const res = await analyzeRisk(text);
        setResult(res);
        setStatus("result");
    };

    const handleFix = async () => {
        if (!text || !result) return;
        setFixing(true);
        const fixedText = await fixRiskyText(text, result.warnings);
        setText(fixedText);
        setFixing(false);
        setStatus("idle"); // Close and let them see the result
    };

    const getIcon = () => {
        if (!result) return <Shield size={24} />;
        if (result.level === "Safe") return <ShieldCheck size={24} className="text-green-500" />;
        return <ShieldAlert size={24} className={result.level === "High" ? "text-red-500" : "text-yellow-500"} />;
    };

    return (
        <>
            {/* Trigger Button */}
            <div className="relative group">
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheck}
                    disabled={status === "analyzing" || !text}
                    className="p-4 bg-white hover:bg-gray-50 text-gray-400 hover:text-blue-500 rounded-full shadow-lg border border-gray-100 transition-colors disabled:opacity-50"
                    title="Check SNS Risks"
                >
                    {status === "analyzing" ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <Shield size={24} />
                        </motion.div>
                    ) : (
                        getIcon()
                    )}
                </motion.button>
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Risk Check
                </div>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {status === "result" && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center p-4 pb-48"
                        onClick={() => setStatus("idle")}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full relative max-h-[70vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setStatus("idle")}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 p-4 rounded-full bg-gray-50">
                                    {getIcon()}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    Risk Level: <span className={
                                        result.level === "Safe" ? "text-green-500" :
                                            result.level === "High" ? "text-red-500" : "text-yellow-500"
                                    }>{result.level}</span>
                                </h3>

                                <p className="text-3xl font-light text-gray-800 mb-4">{result.score}<span className="text-sm text-gray-400 ml-1">/ 100</span></p>

                                <div className="flex flex-wrap gap-2 justify-center mb-4">
                                    {result.warnings.map((w, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {w}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-4 rounded-xl w-full text-left">
                                    {result.reason}
                                </p>

                                {result.level !== "Safe" && (
                                    <button
                                        onClick={handleFix}
                                        disabled={fixing}
                                        className="mt-4 w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {fixing ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                        ) : (
                                            <ShieldCheck size={18} />
                                        )}
                                        {fixing ? "Sanitizing..." : "Auto-Fix Risks"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

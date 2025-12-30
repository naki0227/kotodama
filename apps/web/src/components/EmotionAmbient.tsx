"use client";

import { useUser } from "../store/userContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Color mapping for known emotions
const emotionColors: Record<string, string> = {
    Joy: "bg-orange-100/30",
    Excitement: "bg-yellow-100/30",
    Trust: "bg-blue-100/30",
    Calm: "bg-teal-100/30",
    Empathy: "bg-pink-100/30",
    Love: "bg-rose-100/30",
    Urgency: "bg-red-100/20",
    Anger: "bg-red-200/20",
    Melancholy: "bg-indigo-100/30",
    Serious: "bg-slate-200/30",
    Neutral: "bg-white",
};

// Gradient mapping for more "ambient" feel
const emotionGradients: Record<string, string> = {
    Joy: "from-orange-50 via-white to-transparent",
    Excitement: "from-yellow-50 via-white to-transparent",
    Trust: "from-blue-50 via-white to-transparent",
    Calm: "from-teal-50 via-white to-transparent",
    Empathy: "from-pink-50 via-white to-transparent",
    Love: "from-rose-50 via-white to-transparent",
    Urgency: "from-red-50 via-white to-transparent",
    Anger: "from-red-50 via-white to-transparent",
    Melancholy: "from-indigo-50 via-white to-transparent",
    Serious: "from-slate-100 via-white to-transparent",
    Neutral: "from-white via-white to-transparent",
};

export default function EmotionAmbient() {
    const { analysis } = useUser();
    const [dominantEmotion, setDominantEmotion] = useState("Neutral");

    useEffect(() => {
        if (analysis?.emotions && analysis.emotions.length > 0) {
            // Find the emotion with the highest value
            const top = analysis.emotions.reduce((prev, current) =>
                (prev.value > current.value) ? prev : current
            );
            setDominantEmotion(top.label);
        } else {
            setDominantEmotion("Neutral");
        }
    }, [analysis]);

    // Fallback to "Neutral" logic if emotion not found in map, or try to fuzzy match
    const getGradient = (label: string) => {
        // Exact match
        if (emotionGradients[label]) return emotionGradients[label];

        // Simple keywords fallback
        const lower = label.toLowerCase();
        if (lower.includes("joy") || lower.includes("happy")) return emotionGradients["Joy"];
        if (lower.includes("sad") || lower.includes("sorrow")) return emotionGradients["Melancholy"];
        if (lower.includes("anger") || lower.includes("mad")) return emotionGradients["Anger"];
        if (lower.includes("calm") || lower.includes("peace")) return emotionGradients["Calm"];

        return emotionGradients["Neutral"];
    };

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-[2000ms]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={dominantEmotion}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className={`absolute inset-0 bg-gradient-to-b ${getGradient(dominantEmotion)} opacity-60`}
                />
            </AnimatePresence>
        </div>
    );
}

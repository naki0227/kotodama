"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useUser } from "../store/userContext";

export default function FocusEditor() {
    const { text, setText } = useUser();

    // Dynamic font size calculation
    const getFontSize = (length: number) => {
        if (length < 100) return "text-2xl md:text-4xl";
        if (length < 300) return "text-xl md:text-3xl";
        if (length < 600) return "text-lg md:text-2xl";
        if (length < 1000) return "text-base md:text-xl";
        return "text-sm md:text-lg";
    };

    const fontSizeClass = getFontSize(text.length);

    return (
        <div className="w-full min-h-[60vh] flex flex-col items-center px-6 md:p-12 transition-colors duration-500 bg-transparent">
            <TextareaAutosize
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="ここから、始まる..."
                minRows={1}
                className={`w-full max-w-4xl bg-transparent border-none outline-none resize-none font-light text-gray-800 placeholder:text-gray-200 leading-relaxed selection:bg-gray-100 transition-all duration-500 ease-in-out text-center my-auto ${fontSizeClass}`}
                spellCheck={false}
                autoFocus
                style={{
                    fontWeight: 300,
                }}
            />
        </div>
    );
}

"use client";

import { MotionConfig } from "framer-motion";

// OS の「視差効果を減らす」（prefers-reduced-motion: reduce）を framer-motion に伝える。
// 既定値の "never" のままだと、設定に関係なく scale・x・y・rotate が動く。
// "user" にすると、その環境では transform の動きを止め、opacity などの変化だけ残す。
export default function MotionProvider({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

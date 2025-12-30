"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AnalysisResult } from "../lib/gemini";

export type PersonaDNA = {
    name: string;
    role: string;
    traits: string[];
    portfolioContext: string;
};

// Default Persona based on User info
const defaultPersona: PersonaDNA = {
    name: "naki0227",
    role: "Senior Full-stack Engineer",
    traits: ["Minimalist", "Efficient", "Clean Code", "Creative"],
    portfolioContext: "Creator of Enludus, Nue, StudyReel. Focus on clean UI/UX and practical AI tools.",
};

interface UserContextType {
    user: User | null;
    session: Session | null;
    text: string;
    setText: (text: string) => void;
    kotodamaRate: number; // Linked to analysis score
    analysis: AnalysisResult | null;
    setAnalysis: (result: AnalysisResult | null) => void;
    persona: PersonaDNA;
    setPersona: (persona: PersonaDNA) => void;
    isHumanizing: boolean;
    setIsHumanizing: (val: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [text, setText] = useState("");
    const [isHumanizing, setIsHumanizing] = useState(false);
    const [persona, setPersona] = useState<PersonaDNA>(defaultPersona);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    // Auth State Listener
    useEffect(() => {
        console.log("Debug [UserContext]: Current URL:", window.location.href);
        console.log("Debug [UserContext]: Hash:", window.location.hash);
        console.log("Debug [UserContext]: Search:", window.location.search);

        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("Debug [UserContext]: Initial Session check", session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Debug [UserContext]: Auth State Change", event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Kotodama Rate comes from analysis if available, otherwise fallback to simple mock or 0
    const kotodamaRate = analysis?.score || 0;

    return (
        <UserContext.Provider
            value={{
                user,
                session,
                text,
                setText,
                kotodamaRate,
                analysis,
                setAnalysis,
                persona,
                setPersona,
                isHumanizing,
                setIsHumanizing,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

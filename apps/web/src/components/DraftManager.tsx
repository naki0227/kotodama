"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, FileText, Trash2, X, Loader2, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../store/userContext";
import AuthModal from "./AuthModal";

type Draft = {
    id: string;
    title: string;
    content: string;
    created_at: string;
};

export default function DraftManager() {
    const { user, text, setText } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchDrafts = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("drafts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching drafts:", error);
        } else {
            setDrafts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && user) {
            fetchDrafts();
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        if (!text.trim()) return;

        setSaving(true);
        // Simple title generation: first line or first 20 chars
        const title = text.split("\n")[0].substring(0, 30) || "Untitled Draft";

        const { error } = await supabase.from("drafts").insert({
            user_id: user.id,
            content: text,
            title: title,
        });

        if (error) {
            alert("Error saving draft: " + error.message);
        } else {
            // Refresh list if open
            if (isOpen) fetchDrafts();
            alert("Draft saved!");
        }
        setSaving(false);
    };

    const handleLoad = (draft: Draft) => {
        if (confirm("Load this draft? Current content will be replaced.")) {
            setText(draft.content);
            setIsOpen(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this draft?")) return;

        const { error } = await supabase.from("drafts").delete().eq("id", id);
        if (error) {
            alert("Error deleting draft");
        } else {
            fetchDrafts();
        }
    };

    return (
        <>
            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

            {/* Trigger Button (Top Right, near other tools) */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 right-52 z-40 p-2 text-gray-300 hover:text-green-500 transition-colors"
                title="Drafts & Save"
            >
                <Save size={20} strokeWidth={1.5} />
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
                            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 w-full max-w-lg h-[70vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-medium tracking-tight text-gray-900 flex items-center gap-2">
                                    <FileText size={20} className="text-gray-500" /> Drafts
                                </h2>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
                                {!user ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                        <p className="text-gray-500 mb-4">Sign in to save and access your drafts.</p>
                                        <button
                                            onClick={() => setShowAuth(true)}
                                            className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                ) : loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="animate-spin text-gray-400" />
                                    </div>
                                ) : drafts.length === 0 ? (
                                    <div className="text-center text-gray-400 py-10">No drafts found.</div>
                                ) : (
                                    drafts.map((draft) => (
                                        <div
                                            key={draft.id}
                                            onClick={() => handleLoad(draft)}
                                            className="group p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer relative"
                                        >
                                            <h3 className="font-medium text-gray-800 line-clamp-1">{draft.title}</h3>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(draft.created_at).toLocaleString()}
                                            </p>
                                            <button
                                                onClick={(e) => handleDelete(draft.id, e)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div className="text-xs text-gray-400">
                                    {user ? `Logged in as ${user.email}` : "Guest Mode"}
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !text}
                                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Current Text
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

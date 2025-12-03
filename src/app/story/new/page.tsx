"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AsciiLoader } from "@/components/AsciiLoader";

export default function NewStoryPage() {
    const [title, setTitle] = useState("");
    const [premise, setPremise] = useState("");
    const [characters, setCharacters] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [isGeneratingParams, setIsGeneratingParams] = useState(false);

    const handleFillForMe = async () => {
        setIsGeneratingParams(true);
        try {
            const res = await fetch("/api/generate-story-params", { method: "POST" });
            const data = await res.json();
            if (data.title) setTitle(data.title);
            if (data.premise) setPremise(data.premise);
            if (data.characters) setCharacters(data.characters);
        } catch (error) {
            console.error("Error generating params:", error);
        } finally {
            setIsGeneratingParams(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // ... existing submit logic ...
        e.preventDefault();
        if (!title || !premise) return;

        setLoading(true);

        try {
            const res = await fetch("/api/create-story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, premise, characters }),
            });

            if (!res.ok) {
                const error = await res.text();
                console.error("Failed to create story:", error);
                alert("Failed to initialize protocol. Check console for details.");
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (data.slug) {
                router.push(`/story/${data.slug}`);
            }
        } catch (error) {
            console.error("Error creating story:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            {loading && <AsciiLoader />}

            {!loading && (
                <div className="w-full max-w-[600px] animate-slideInUp">
                    <h1 className="text-3xl font-bold mb-8 text-center tracking-widest text-orange-500">
                        INITIALIZE NEW PROTOCOL
                    </h1>

                    <button
                        type="button"
                        onClick={handleFillForMe}
                        disabled={isGeneratingParams}
                        className="mb-6 text-xs text-orange-500/60 hover:text-orange-500 uppercase tracking-widest border border-orange-500/20 hover:border-orange-500/50 px-4 py-2 transition-all"
                    >
                        {isGeneratingParams ? "GENERATING PARAMETERS..." : "AUTO-GENERATE PARAMETERS (FILL FOR ME)"}
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                                Protocol Name
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 p-4 text-[#eee] focus:border-orange-500 outline-none transition-colors font-mono"
                                placeholder="e.g. Project Chimera"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                                Initial Parameters (Premise)
                            </label>
                            <textarea
                                value={premise}
                                onChange={(e) => setPremise(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 p-4 text-[#eee] focus:border-orange-500 outline-none transition-colors font-mono h-32"
                                placeholder="e.g. You wake up in a cryopod on a drifting spaceship..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                                Subject Profile (Characters)
                            </label>
                            <textarea
                                value={characters}
                                onChange={(e) => setCharacters(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 p-4 text-[#eee] focus:border-orange-500 outline-none transition-colors font-mono h-32"
                                placeholder="e.g. Commander Shepard: A veteran soldier..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-500/10 border border-orange-500 text-orange-500 py-4 font-bold tracking-widest hover:bg-orange-500 hover:text-black transition-all duration-300 uppercase"
                        >
                            Initialize
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

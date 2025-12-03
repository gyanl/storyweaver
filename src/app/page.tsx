"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AsciiLoader } from "@/components/AsciiLoader";

export default function Home() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/create-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
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
        <div className="w-full max-w-[700px] animate-slideInUp">
          <h1 className="text-3xl font-bold mb-8 text-center tracking-widest text-orange-500">
            INITIALIZE NEW PROTOCOL
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-3">
                Describe the story, the setting, the characters
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/40 border border-white/20 p-4 text-[#eee] focus:border-orange-500 outline-none transition-colors font-mono h-48 resize-none"
                placeholder="e.g., A cyberpunk detective story set in Neo-Tokyo. The protagonist is a former cop turned private investigator who specializes in AI crimes. They're joined by a hacker sidekick and pursued by a corrupt corporate security chief..."
                required
              />
              <div className="text-white/40 text-xs mt-2 font-mono">
                The AI will fill in any gaps to create a compelling story with rich characters
              </div>
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

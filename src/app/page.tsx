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
            WEAVE A NEW STORY
          </h1>



          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-3">
                Describe the story, the setting, the characters
              </label>
              <div className="text-white/40 text-xs mb-2 font-mono">
                The AI will fill in any gaps to create a plot
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/40 border border-white/20 p-4 text-[#eee] focus:border-orange-500 outline-none transition-colors font-mono h-48 resize-none"
                placeholder="e.g., A cyberpunk detective story set in Neo-Tokyo. The protagonist is a former cop turned private investigator who specializes in AI crimes. They're joined by a hacker sidekick and pursued by a corrupt corporate security chief..."
                required
              />

            </div>

            <button
              type="submit"
              className="w-full bg-orange-500/10 border border-orange-500 text-orange-500 py-4 font-bold tracking-widest hover:bg-orange-500 hover:text-black transition-all duration-300 uppercase"
            >
              Initialize
            </button>
          </form>

          <div className="mt-8 p-4 border border-white/10 bg-white/5 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-orange-500 font-bold text-sm uppercase tracking-wider">Want a shortcut?</h3>
              <button
                onClick={() => {
                  const text = "Describe me and the people in my life like characters in a story, and then write the plot outline for a murder mystery, thriller or sci-fi story with all of these characters. Give just these details as output and nothing else.";
                  navigator.clipboard.writeText(text);
                  alert("Prompt copied to clipboard!");
                }}
                className="text-xs bg-orange-500/20 hover:bg-orange-500/40 text-orange-500 px-2 py-1 rounded transition-colors uppercase font-mono"
              >
                Copy Prompt
              </button>
            </div>
            <p className="text-white/60 text-sm mb-3">
              Paste this into ChatGPT to generate a personal story outline:
            </p>
            <div className="bg-black/40 p-3 rounded text-xs font-mono text-white/40 italic border border-white/5">
              "Describe me and the people in my life like characters in a story, and then write the plot outline for a murder mystery, thriller, sci-fi or another type of story you think I would enjoy, featuring all of these characters. Give just these details as output and nothing else."
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

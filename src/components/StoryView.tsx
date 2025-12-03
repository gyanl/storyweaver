"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AsciiLoader } from "@/components/AsciiLoader";
import { Typewriter } from "@/components/Typewriter";
import { createClient } from "@supabase/supabase-js";

// We need a client-side supabase for potential subscriptions or just use the API
// Actually, for this component, we can just receive props.

interface Choice {
    text: string;
    next_node_id: string | null;
}

interface NodeData {
    id: string;
    content: string;
    choices: Choice[];
}

interface StoryViewProps {
    initialNode: NodeData;
    storyId: string;
    storySlug: string;
}

export default function StoryView({ initialNode, storyId, storySlug }: StoryViewProps) {
    const [node, setNode] = useState<NodeData>(initialNode);
    const [showOptions, setShowOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [narrativeComplete, setNarrativeComplete] = useState(false);

    // Reset state when node changes
    useEffect(() => {
        setNode(initialNode);
        setShowOptions(false);
        setLoading(false);
        setNarrativeComplete(false);
    }, [initialNode]);

    // Handle auto-choice from URL
    useEffect(() => {
        const autoChoiceText = searchParams.get("choice");
        if (autoChoiceText && !loading && node.choices) {
            const choice = node.choices.find(c => c.text === autoChoiceText);
            if (choice) {
                // Clear the param so we don't loop or re-trigger on back
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.delete("choice");
                router.replace(`/story/${storySlug}/${node.id}?${newParams.toString()}`);

                handleChoice(choice);
            }
        }
    }, [searchParams, node, loading, storySlug]);

    const handleChoice = async (choice: Choice) => {
        if (choice.next_node_id) {
            // Navigate to existing node
            router.push(`/story/${storySlug}/${choice.next_node_id}`);
        } else {
            // Generate new node
            setLoading(true);
            try {
                const res = await fetch("/api/generate-node", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        storyId,
                        parentNodeId: node.id,
                        choiceText: choice.text,
                    }),
                });

                if (!res.ok) {
                    console.error("API Error Status:", res.status, res.statusText);
                    const text = await res.text();
                    console.error("API Error Body:", text);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                if (data.newNodeId) {
                    router.push(`/story/${storySlug}/${data.newNodeId}`);
                } else {
                    console.error("Failed to generate node. Data:", data);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Error generating node:", e);
                setLoading(false);
            }
        }
    };

    const formattedContent = node.content.replace(/\\n/g, "\n");
    const parts = formattedContent.split("CONSOLE:");
    const narrativeText = parts[0].trim();
    const consoleText = parts.length > 1 ? parts[1].trim() : "";

    useEffect(() => {
        // If there is no narrative text, mark it as complete immediately
        if (!narrativeText && !narrativeComplete) {
            setNarrativeComplete(true);
        }
    }, [narrativeText, narrativeComplete]);

    return (
        <div className="min-h-screen flex flex-col items-center p-4 relative">
            {loading && <AsciiLoader />}

            {!loading && (
                <>
                    <div className="w-full max-w-[600px] pt-[60px] min-h-[250px]">
                        {narrativeText && (
                            <div className="mb-8 text-[#eee] leading-relaxed whitespace-pre-wrap">
                                <Typewriter
                                    text={narrativeText}
                                    baseSpeed={20}
                                    onComplete={() => setNarrativeComplete(true)}
                                />
                            </div>
                        )}

                        {consoleText && narrativeComplete && (
                            <div className="console-box mb-8">
                                <Typewriter
                                    text={consoleText}
                                    onComplete={() => setShowOptions(true)}
                                    baseSpeed={10}
                                />
                            </div>
                        )}

                        {/* If no console text, show options after narrative */}
                        {!consoleText && narrativeComplete && !showOptions && (
                            <div className="hidden" ref={(el) => { if (el) setShowOptions(true); }}></div>
                        )}
                    </div>

                    {showOptions && (
                        <div className="animate-appearLater text-center mt-8 w-full max-w-[600px]">
                            <div className="text-white/75 uppercase font-bold tracking-widest text-sm mb-4">
                                YOUR CHOICES
                            </div>

                            <div className="flex flex-col md:flex-row justify-center items-center flex-wrap">
                                {node.choices.map((choice, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleChoice(choice)}
                                        className="option-btn"
                                    >
                                        {choice.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

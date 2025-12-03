"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

export default function StoryView({ initialNode, storyId }: StoryViewProps) {
    const [node, setNode] = useState<NodeData>(initialNode);
    const [showOptions, setShowOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Reset state when node changes (e.g. navigation)
    useEffect(() => {
        setNode(initialNode);
        setShowOptions(false);
        setLoading(false);
    }, [initialNode]);

    const handleChoice = async (choice: Choice) => {
        if (choice.next_node_id) {
            // Navigate to existing node
            router.push(`/story/${storyId}/${choice.next_node_id}`);
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

                const data = await res.json();
                if (data.newNodeId) {
                    router.push(`/story/${storyId}/${data.newNodeId}`);
                } else {
                    console.error("Failed to generate node");
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 relative">
            <div className="w-full max-w-[600px] pt-[60px] min-h-[250px]">
                {/* We can parse the content to separate the "Console" part if needed. 
            For now, just dump it all in the typewriter or split by newlines. 
            The original had a specific layout. Let's try to preserve it. */}

                <div className="console-box mb-8">
                    <Typewriter
                        text={node.content}
                        onComplete={() => setShowOptions(true)}
                        baseSpeed={10}
                    />
                </div>
            </div>

            {(showOptions && !loading) && (
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

            {loading && (
                <div className="animate-appearLater text-center mt-8 text-orange-500 font-mono">
                    <span className="animate-blink">PROCESSING...</span>
                </div>
            )}
        </div>
    );
}

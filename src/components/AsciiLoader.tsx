"use client";

import { useEffect, useState } from "react";

const CHARS = ["*", "+", "-", "/", "\\", "|", "@", "#", "?", "!", "0", "1", "<", ">"];

interface FloatingChar {
    id: number;
    char: string;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

export function AsciiLoader() {
    const [chars, setChars] = useState<FloatingChar[]>([]);

    useEffect(() => {
        // Generate random characters
        const newChars: FloatingChar[] = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            x: Math.random() * 100, // vw
            y: Math.random() * 100, // vh
            size: Math.random() * 1.5 + 0.5, // rem
            duration: Math.random() * 3 + 2, // seconds
            delay: Math.random() * 2, // seconds
        }));
        setChars(newChars);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-[#111] overflow-hidden pointer-events-none">
            {chars.map((c) => (
                <div
                    key={c.id}
                    className="absolute text-green-500/50 font-mono animate-float"
                    style={{
                        left: `${c.x}vw`,
                        top: `${c.y}vh`,
                        fontSize: `${c.size}rem`,
                        animationDuration: `${c.duration}s`,
                        animationDelay: `${c.delay}s`,
                        opacity: 0,
                    }}
                >
                    {c.char}
                </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-green-500 font-mono animate-pulse tracking-widest text-xl">
                    ...
                </span>
            </div>
        </div>
    );
}

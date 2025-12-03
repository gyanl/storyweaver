"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
    text: string;
    baseSpeed?: number;
    onComplete?: () => void;
}

export function Typewriter({ text, baseSpeed = 20, onComplete }: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const char = text.charAt(currentIndex);
            let speed = baseSpeed;

            // Mimic the original logic for pacing
            if (char === ".") speed = 120;
            else if (char === " ") speed = 60;
            else speed = 40;

            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + char);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            if (onComplete) onComplete();
        }
    }, [currentIndex, text, baseSpeed, onComplete]);

    return (
        <div className="inline">
            <span id="typewriter">{displayedText}</span>
            <span className="animate-blink text-orange-500">|</span>
        </div>
    );
}

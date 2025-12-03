"use client";

import { useState, useEffect, useMemo } from "react";
import { parseRichText, TextSegment } from "./RichTextRenderer";

interface TypewriterProps {
    text: string;
    baseSpeed?: number;
    onComplete?: () => void;
}

export function Typewriter({ text, baseSpeed = 20, onComplete }: TypewriterProps) {
    const [charIndex, setCharIndex] = useState(0);

    // Parse text into segments once
    const segments = useMemo(() => {
        console.log("Typewriter parsing text:", text);
        console.log("Text char codes:", text.split('').map(c => c.charCodeAt(0)));
        return parseRichText(text);
    }, [text]);

    // Calculate total length of actual content (excluding tags)
    const totalLength = useMemo(() => segments.reduce((acc, seg) => acc + seg.text.length, 0), [segments]);

    useEffect(() => {
        if (charIndex < totalLength) {
            // Determine current char for speed calculation
            let currentPos = 0;
            let char = "";
            for (const seg of segments) {
                if (charIndex >= currentPos && charIndex < currentPos + seg.text.length) {
                    char = seg.text[charIndex - currentPos];
                    break;
                }
                currentPos += seg.text.length;
            }

            let speed = baseSpeed;
            if (char === ".") speed = 120;
            else if (char === " ") speed = 60;
            else speed = 40;

            const timeout = setTimeout(() => {
                setCharIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            if (onComplete) onComplete();
        }
    }, [charIndex, totalLength, baseSpeed, onComplete, segments]);

    // Render logic
    const renderContent = () => {
        let currentPos = 0;
        return segments.map((seg, i) => {
            if (currentPos >= charIndex) return null; // Segment not reached yet

            const segmentStart = currentPos;
            const segmentEnd = currentPos + seg.text.length;
            currentPos += seg.text.length;

            let textToRender = seg.text;
            if (charIndex < segmentEnd) {
                // Partial render of this segment
                textToRender = seg.text.substring(0, charIndex - segmentStart);
            }

            return (
                <span key={i} className={seg.effect ? `effect-${seg.effect}` : undefined}>
                    {textToRender}
                </span>
            );
        });
    };

    return (
        <div className="inline">
            <span id="typewriter">{renderContent()}</span>
            <span className="animate-blink text-orange-500">|</span>
        </div>
    );
}

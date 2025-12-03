import React from 'react';

export type TextSegment = {
    text: string;
    effect?: 'glitch' | 'shake' | 'terminal' | 'warning';
};

export function parseRichText(text: string): TextSegment[] {
    // Regex to match tags. Uses [\s\S] to match newlines. Case insensitive.
    const regex = /\[(glitch|shake|terminal|warning)\]([\s\S]*?)\[\/\1\]/gi;
    let lastIndex = 0;
    const segments: TextSegment[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                text: text.substring(lastIndex, match.index),
            });
        }

        const effect = match[1].toLowerCase() as TextSegment['effect'];
        const content = match[2];

        console.log("Parsed segment:", { effect, content });

        // Add the effect segment
        segments.push({
            text: content,
            effect: effect,
        });

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            text: text.substring(lastIndex),
        });
    }

    return segments;
}

interface RichTextRendererProps {
    text: string;
    className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ text, className = '' }) => {
    const segments = parseRichText(text);

    return (
        <span className={className}>
            {segments.map((segment, index) => (
                <span
                    key={index}
                    className={segment.effect ? `effect-${segment.effect}` : undefined}
                >
                    {segment.text}
                </span>
            ))}
        </span>
    );
};

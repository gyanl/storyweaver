"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export function ShareButton() {
    const [copied, setCopied] = useState(false);
    const pathname = usePathname();

    // Only show share button on story pages
    if (!pathname.startsWith("/story/")) {
        return null;
    }

    const handleShare = async () => {
        // Extract story slug from pathname (e.g., /story/slug/nodeId -> /story/slug)
        const parts = pathname.split("/");
        if (parts.length >= 3) {
            const storySlug = parts[2];
            const url = `${window.location.origin}/story/${storySlug}`;

            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors font-mono uppercase tracking-wider text-sm"
        >
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share this Story"}</span>
            <span className="sm:hidden">{copied ? "Copied!" : "Share"}</span>
            <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
            </svg>
        </button>
    );
}

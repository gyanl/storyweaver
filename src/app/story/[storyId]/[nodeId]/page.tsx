import { getStory, getRootNode, getNode } from "@/lib/data";
import StoryView from "@/components/StoryView";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    params: Promise<{
        storyId: string;
        nodeId?: string;
    }>;
}

export default async function StoryPage({ params }: PageProps) {
    const { storyId, nodeId } = await params;

    // Check if story exists (by slug or ID? The route says storyId, but maybe we want slug)
    // Let's assume storyId is the slug for the URL, but we need the UUID.
    // Actually, let's stick to UUID for simplicity in logic, or handle slug lookup.
    // If storyId is 'rish-e', we look it up.

    let story = await getStory(storyId);

    // If not found by slug, maybe it is a UUID?
    // For now, assume slug.
    if (!story) {
        // Try fetching by ID if we implement that, or just 404
        return notFound();
    }

    let currentNode;

    if (!nodeId) {
        // Fetch root node
        currentNode = await getRootNode(story.id);
        if (currentNode) {
            // Redirect to the explicit node URL to keep history clean? 
            // Or just render it. Rendering is better for "start" feeling.
            // But for consistency, let's redirect to /story/slug/nodeId
            redirect(`/story/${storyId}/${currentNode.id}`);
        } else {
            return <div>Error: No root node found for this story.</div>;
        }
    } else {
        currentNode = await getNode(nodeId);
    }

    if (!currentNode) return notFound();

    return <StoryView initialNode={currentNode} storyId={story.id} />;
}

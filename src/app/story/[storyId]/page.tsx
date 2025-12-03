import { getStory, getRootNode } from "@/lib/data";
import { redirect, notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        storyId: string;
    }>;
}

export default async function StoryRootPage({ params }: PageProps) {
    const { storyId } = await params;
    const story = await getStory(storyId);

    if (!story) return notFound();

    const rootNode = await getRootNode(story.id);

    if (rootNode) {
        redirect(`/story/${storyId}/${rootNode.id}`);
    }

    return <div>Story has no content yet.</div>;
}

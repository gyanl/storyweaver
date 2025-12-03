import { getStory, getRootNode } from "@/lib/data";
import { redirect, notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        storyId: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StoryRootPage({ params, searchParams }: PageProps) {
    const { storyId } = await params;
    const query = await searchParams;
    const story = await getStory(storyId);

    if (!story) return notFound();

    const rootNode = await getRootNode(story.id);

    if (rootNode) {
        const queryString = new URLSearchParams(query as Record<string, string>).toString();
        const url = `/story/${storyId}/${rootNode.id}${queryString ? `?${queryString}` : ""}`;
        redirect(url);
    }

    return <div>Story has no content yet.</div>;
}

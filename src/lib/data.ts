import { supabase } from "@/lib/supabase";

export async function getStory(slug: string) {
    const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

export async function getStories() {
    const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return [];
    return data;
}

export async function getNode(nodeId: string) {
    const { data, error } = await supabase
        .from("nodes")
        .select("*")
        .eq("id", nodeId)
        .single();

    if (error) return null;
    return data;
}

export async function getRootNode(storyId: string) {
    // Assuming the root node is the one with no parent? 
    // Or we can query by created_at asc limit 1 for the story.
    // Ideally we'd store a root_node_id on the story, but for now:
    const { data, error } = await supabase
        .from("nodes")
        .select("*")
        .eq("story_id", storyId)
        .is("parent_id", null)
        .single();

    if (error) return null;
    return data;
}

export async function getStoryWithJourneyProgress(storyId: string) {
    const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .single();

    if (error) return null;
    return data;
}

export async function getNodePath(nodeId: string): Promise<any[]> {
    // Get the full path from root to current node
    const path: any[] = [];
    let currentNodeId: string | null = nodeId;

    while (currentNodeId) {
        const node = await getNode(currentNodeId);
        if (!node) break;
        path.unshift(node); // Add to beginning of array
        currentNodeId = node.parent_id;
    }

    return path;
}

export async function getRecentChoiceHistory(nodeId: string, count: number = 3) {
    // Get the last N nodes in the path with their choices
    const path = await getNodePath(nodeId);
    const recentNodes = path.slice(-count);

    return recentNodes.map(node => ({
        page: node.page_number,
        nodeId: node.id,
        presented: node.choices?.map((c: any) => c.text) || [],
        // We'll need to track which choice was selected - for now we can infer from the path
    }));
}

export async function getPageNumber(storyId: string, nodeId: string): Promise<number> {
    // Calculate page number by counting nodes in the path
    const path = await getNodePath(nodeId);
    return path.length;
}


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

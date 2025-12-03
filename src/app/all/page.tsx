import { getStories } from "@/lib/data";
import Link from "next/link";

export default async function AllStoriesPage() {
    const stories = await getStories();

    return (
        <div className="min-h-screen flex flex-col items-center p-4 relative">
            <div className="w-full max-w-[800px] pt-[100px]">
                <h1 className="text-3xl font-bold mb-8 text-center tracking-widest text-orange-500">
                    ALL PROTOCOLS
                </h1>

                <div className="grid gap-6">
                    {stories?.map((story) => (
                        <Link
                            href={`/story/${story.slug}`}
                            key={story.id}
                            className="group block p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300 bg-black/40 hover:bg-black/60 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h2 className="text-2xl font-bold text-[#eee] group-hover:text-orange-400 transition-colors">
                                {story.title}
                            </h2>
                            <p className="text-white/60 leading-relaxed font-mono text-sm mt-2">
                                {story.intro_text || story.initial_prompt}
                            </p>
                        </Link>
                    ))}

                    {stories?.length === 0 && (
                        <div className="text-center text-white/40 font-mono">
                            NO STORIES FOUND IN DATABASE
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

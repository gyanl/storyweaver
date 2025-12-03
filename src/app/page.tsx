import { getStories } from "@/lib/data";
import Link from "next/link";

export default async function Home() {
  const stories = await getStories();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative">
      <div className="w-full max-w-[800px] pt-[60px]">
        <h1 className="text-4xl font-bold mb-12 text-center tracking-[0.2em] text-orange-500 animate-pulse">
          STORYWEAVER
        </h1>

        <div className="grid gap-6">
          <Link
            href="/story/new"
            className="group block p-6 border border-orange-500/30 hover:border-orange-500 transition-all duration-300 bg-orange-500/5 hover:bg-orange-500/10 relative overflow-hidden text-center"
          >
            <h2 className="text-2xl font-bold mb-2 text-orange-500 group-hover:text-orange-400 transition-colors tracking-widest uppercase">
              + Initialize New Protocol
            </h2>
            <p className="text-orange-500/60 font-mono text-sm">
              Begin a new simulation with custom parameters
            </p>
          </Link>

          {stories?.map((story) => (
            <Link
              href={`/story/${story.slug}`}
              key={story.id}
              className="group block p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300 bg-black/40 hover:bg-black/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-2xl font-bold mb-3 text-[#eee] group-hover:text-orange-400 transition-colors">
                {story.title}
              </h2>
              <p className="text-white/60 leading-relaxed font-mono text-sm">
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

      <div className="fixed bottom-0 left-0 right-0 w-full text-center pb-5 text-[#e9e6f5]/80 text-sm bg-gradient-to-t from-[#111] to-transparent pt-10">
        Made with <span className="animate-heartPulse inline-block text-[#FF4344]">&hearts;</span> for Rishi
      </div>
    </div>
  );
}

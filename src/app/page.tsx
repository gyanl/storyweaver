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

          {/* Story list removed as per request */}

        </div>
      </div>
    </div>
  );
}

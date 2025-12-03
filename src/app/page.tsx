"use client";

import { useState } from "react";
import Link from "next/link";
import { Typewriter } from "@/components/Typewriter";

export default function Home() {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative">
      <div className="w-full max-w-[600px] pt-[60px] min-h-[250px]">
        <h2 className="text-[#eee] text-2xl mb-4 font-bold">Welcome, Rish-e.</h2>

        <p className="mb-4">
          You open your eyes, blinking uncomfortably as you try to make sense of your surroundings. The ground is a muddy brown and a cloudless blue sky stretches all around you.
        </p>
        <p className="mb-4">Where are you? You don't know.</p>
        <p className="mb-4">A screen pops up in front of you.</p>

        <div className="console-box">
          <Typewriter
            text="This is a diagnostic test designed to evaluate system functions. Press 'Initiate Test' when you are ready to begin."
            onComplete={() => setShowOptions(true)}
          />
        </div>
      </div>

      {showOptions && (
        <div className="animate-appearLater text-center mt-8 w-full max-w-[600px]">
          <div className="text-white/75 uppercase font-bold tracking-widest text-sm mb-4">
            YOUR CHOICES
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center">
            <Link href="/story/initiate" className="option-btn">
              Initiate Test
            </Link>

            <Link href="/story/scared" className="option-btn">
              I'm Scared
            </Link>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 w-full text-center pb-5 text-[#e9e6f5]/80 text-sm bg-[#333]">
        <br />
        Made with <span className="animate-heartPulse inline-block text-[#FF4344]">&hearts;</span> for Rishi
      </div>
    </div>
  );
}

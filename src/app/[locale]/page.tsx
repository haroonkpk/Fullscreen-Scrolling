"use client";

import { useRef, useEffect } from "react";
import SnapRoll from "@/src/components/utils/SnapRoll";
import "@/src/styles/snaproll.css";

// --- COMPONENTS ---

const FixedBackground = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-cyan-600">
      <div className="text-center opacity-30">
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter">
          Section 02
        </h1>
      </div>
    </div>
  );
};

const SectionOne = () => {
  return (
    <div className="w-full h-full flex flex-col bg-rose-500 items-center justify-center p-8">
      <div className="text-center opacity-40">
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter">
          Section 01
        </h1>
      </div>
    </div>
  );
};

const SectionTwoTransparent = () => {
  return <div className="w-full h-full flex items-center justify-center"></div>;
};

const SectionThree = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-green-700 text-white p-8">
      <div className="text-center opacity-40">
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter">
          Section 03
        </h1>
      </div>
    </div>
  );
};

const SectionFour = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-teal-500 text-white p-8">
      <div className="text-center opacity-40">
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter">
          Section 04
        </h1>
      </div>
    </div>
  );
};

const SectionFive = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-500 text-white p-8">
      <div className="text-center opacity-40">
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter">
          Section 05
        </h1>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const snapRollInstance = useRef<SnapRoll | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    snapRollInstance.current = new SnapRoll({
      container: containerRef.current,
      sectionSelector: ".sr-sec",
      scrollTimeout: 1000,
      wheelDeltaThreshold: 30,
      touchThreshold: 50,
    });

    return () => {
      if (snapRollInstance.current) snapRollInstance.current.destroy();
    };
  }, []);

  return (
    <main
      ref={containerRef}
      id="page"
      className="sr-cont relative w-full h-screen overflow-hidden bg-black"
    >
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        <FixedBackground />
      </div>

      {/* 1. */}
      <section className="sr-sec relative z-10 h-screen w-full">
        <SectionOne />
      </section>

      {/* 2. */}
      <section className="sr-sec relative z-10 h-screen w-full bg-transparent pointer-events-auto">
        <SectionTwoTransparent />
      </section>

      {/* 3. */}
      <section className="sr-sec relative z-10 h-screen w-full">
        <SectionThree />
      </section>

      {/* 4. */}
      <section className="sr-sec relative z-10 h-screen w-full">
        <SectionFour />
      </section>

      {/* 5. */}
      <section className="sr-sec relative z-10 h-screen w-full">
        <SectionFive />
      </section>
    </main>
  );
}

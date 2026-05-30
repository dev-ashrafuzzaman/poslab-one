import React, { useEffect, useState } from "react";

export default function SplashScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [statusStage, setStatusStage] = useState(0);

  const statusMessages = [
    {
      text: "Securing handshake protocol...",
      subtitle: "Establishing encrypted gateway",
    },
    {
      text: "Syncing system modules...",
      subtitle: "Loading local database assets",
    },
    {
      text: "Optimizing terminal workspace...",
      subtitle: "Rendering point-of-sale interface",
    },
    { text: "System ready.", subtitle: "Launching POSLAB ONE Dashboard" },
  ];

  // Smooth realistic variable loading interval
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        // Dynamic step updates for status text messages
        if (prev < 25) setStatusStage(0);
        else if (prev >= 25 && prev < 60) setStatusStage(1);
        else if (prev >= 60 && prev < 90) setStatusStage(2);
        else setStatusStage(3);

        // Adds random increments to make the load bar feel organic
        const increment = Math.floor(Math.random() * 3) + 1;
        return Math.min(prev + increment, 100);
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f6f8fb] relative overflow-hidden font-sans select-none">
      {/* 1. DYNAMIC HIGH-ATTRACTION BACKGROUND ELEMENTS */}
      {/* Premium Glass-Dot Architectural Canvas Grid */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Vivid Colorful Light Flares leaking from behind the glass card */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-112.5 h-112.5 bg-linear-to-tr from-blue-400/20 via-indigo-300/25 to-purple-400/20 rounded-full blur-[90px] pointer-events-none animate-[pulse_6s_infinite_alternate]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-75 h-75 bg-emerald-300/20 rounded-full blur-[80px] pointer-events-none" />

      {/* 2. THE MAIN FLOATING WHITE GLASS PANEL */}
      <div className="relative w-full max-w-96.25 mx-4 p-8 rounded-[36px] bg-white/45 backdrop-blur-3xl border border-white/70 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] text-center overflow-hidden">
        {/* Subtle iOS diagonal reflection glint */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3.5s_infinite] pointer-events-none" />

        {/* ================================================================= */}
        {/* COMPONENT A: SEPARATED FLOATING APPLE-STYLE BRAND ICON POD        */}
        {/* ================================================================= */}
        <div className="flex flex-col items-center justify-center relative mt-2">
          {/* Concentric Animated Radar Wave Rings backing the icon */}
          <div className="absolute w-32 h-32 rounded-full border border-blue-400/20 animate-ping opacity-40 duration-1000 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full border border-indigo-400/10 animate-[pulse_2s_infinite] pointer-events-none" />

          {/* Isolated Luxury Hard-Glass Rounded Icon Box */}
          <div className="w-22 h-22 rounded-3xl bg-linear-to-b from-white to-slate-50 flex items-center justify-center border border-slate-200/80 shadow-[0_16px_32px_-12px_rgba(15,23,42,0.15),inset_0_2px_4px_rgba(255,255,255,0.9)] relative z-10 transition-all duration-500 hover:scale-105">
            {/* Holographic linear tint accent layer inside the box */}
            <div className="absolute inset-0 rounded-[23px] bg-linear-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* TARGET BRAND ICON SVG */}
            <svg
              className="w-11 h-11 text-slate-900 filter drop-shadow-[0_3px_6px_rgba(15,23,42,0.08)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3h18v18H3z" className="opacity-10" />
              <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
              <path
                d="M7 10h4v4H7z"
                fill="currentColor"
                className="text-blue-600"
              />
              <path d="M13 10h4M13 14h4" />
            </svg>
          </div>

          {/* Luxury High-Contrast Typography */}
          <h1 className="text-2xl font-black tracking-[0.18em] text-slate-900 mt-6 pl-1 drop-shadow-sm">
            POSLAB<span className="text-blue-600 font-medium">ONE</span>
          </h1>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mt-1 block">
            Enterprise System
          </span>
        </div>
        {/* ================================================================= */}

        {/* COMPONENT B: STATUS METRICS WITH ICONS */}
        <div className="mt-10 space-y-3">
          {/* System Active Badge Pillar */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 backdrop-blur-md">
            <svg
              className="w-3 h-3 text-blue-600 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">
              Initializing
            </span>
          </div>

          {/* Dual Text Status Field */}
          <div className="pt-1 px-2">
            <h2 className="text-sm font-bold tracking-wide text-slate-800 transition-all duration-300 min-h-5">
              {statusMessages[statusStage].text}
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5 min-h-4">
              {statusMessages[statusStage].subtitle}
            </p>
          </div>
        </div>

        {/* COMPONENT C: GLOWING PREMIUM PROGRESS MATRIX */}
        <div className="mt-8 mb-2">
          <div className="relative">
            {/* Outer Progress Track Wrapper */}
            <div className="w-full h-2 bg-slate-950/5 rounded-full overflow-hidden p-[1.5px] border border-white/60 shadow-inner">
              {/* Dynamic Animated Active Bar */}
              <div
                className="h-full bg-linear-to-r from-blue-600 via-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-[0_2px_6px_rgba(37,99,235,0.25)] relative"
                style={{ width: `${loadingProgress}%` }}
              >
                {/* Micro white-hot trailing light on edge of progress */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full blur-[1px] opacity-80" />
              </div>
            </div>
          </div>

          {/* Metadata Footer bar */}
          <div className="flex justify-between items-center mt-3 px-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
              <svg
                className="w-3 h-3 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              v3.0.4-SECURE
            </div>
            <span className="text-xs font-black tracking-wider text-slate-800 font-mono">
              {loadingProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Screen Decorative branding node */}
      <div className="absolute bottom-6 flex items-center gap-1.5 opacity-60">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <p className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase">
          Poslab Architecture Ecosystem
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </div>

      {/* Embedded CSS keyframe helper string for standard micro-reflections */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(5deg); }
          100% { transform: translateX(100%) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

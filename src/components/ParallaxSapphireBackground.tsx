import React, { useEffect, useState } from "react";

export const ParallaxSapphireBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax offsets at different depth speeds
  const layer1Y = scrollY * 0.14;
  const layer2Y = scrollY * -0.08;
  const layer3Y = scrollY * 0.05;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none parallax-background"
    >
      {/* Base Light Blue Radial Gradient Field */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(186,230,253,0.5),rgba(240,249,255,0.95))]" />

      {/* Layer 1: Luminous Sky Blue & Azure Glow Orbs */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${layer1Y}px, 0)` }}
      >
        {/* Top-left focal sky blue orb */}
        <div className="absolute -top-32 -left-32 w-[680px] h-[680px] rounded-full bg-sky-300/35 blur-[140px] animate-parallax-drift-a" />

        {/* Top-right soft azure core */}
        <div className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-blue-300/30 blur-[160px] animate-parallax-drift-b" />

        {/* Mid-canvas oceanic light flare */}
        <div className="absolute top-2/3 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-200/40 blur-[150px] animate-sapphire-pulse" />
      </div>

      {/* Layer 2: Subtle Academic Geometric Grid & Constellation Rings */}
      <div
        className="absolute inset-0 will-change-transform opacity-40"
        style={{ transform: `translate3d(0, ${layer2Y}px, 0)` }}
      >
        <svg
          className="w-full h-full text-sky-400/25"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="academic-grid-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 4"
              />
              <circle cx="60" cy="0" r="1.5" fill="currentColor" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#academic-grid-pattern)" />
        </svg>

        {/* Subtle decorative concentric coordinate rings in the background */}
        <div className="absolute top-36 right-1/4 w-[480px] h-[480px] rounded-full border border-sky-300/30 pointer-events-none" />
        <div className="absolute top-48 right-[27%] w-[320px] h-[320px] rounded-full border border-blue-300/25 border-dashed pointer-events-none" />
      </div>

      {/* Layer 3: Ambient Soft Blue Shimmer Field */}
      <div
        className="absolute inset-0 will-change-transform opacity-30"
        style={{ transform: `translate3d(0, ${layer3Y}px, 0)` }}
      >
        <div className="absolute top-1/2 -left-20 w-[450px] h-[450px] rounded-full bg-cyan-300/25 blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-[550px] h-[550px] rounded-full bg-sky-400/20 blur-[150px]" />
      </div>

      {/* Subtle top edge specular highlight glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
    </div>
  );
};

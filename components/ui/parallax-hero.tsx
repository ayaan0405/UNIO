"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
//  Pure Framer Motion parallax — no GSAP, no Lenis conflict.
//  Each layer uses useTransform on the SAME global scrollYProgress
//  but with different output ranges, creating the depth illusion.
//
//  Layer 1 — sky/buildings   → moves the LEAST  (feels far back)
//  Layer 2 — string lights   → moves a bit more
//  Layer 3 — neon arches     → moves noticeably
//  Layer 4 — ground glow     → moves the MOST   (feels closest)
// ─────────────────────────────────────────────────────────────────

const IMAGE = "";

interface Layer {
  id: number;
  // How many px to travel from scroll 0% → 100%
  yRange: [number, number];
  scale: number;
  opacity: number;
  background: string;
  filter?: string;
  blend: string;
  zIndex: number;
}

const LAYERS: Layer[] = [
  {
    id: 1,
    yRange: [0, 120],       // barely moves — distant sky
    scale: 1.40,
    opacity: 0.50,
    background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)",
    blend: "normal",
    zIndex: 1,
  },
  {
    id: 2,
    yRange: [0, 200],       // moves a little more
    scale: 1.28,
    opacity: 0.38,
    background: "radial-gradient(circle at 30% 40%, rgba(16,185,129,0.12) 0%, transparent 50%)",
    blend: "screen",
    zIndex: 2,
  },
  {
    id: 3,
    yRange: [0, 300],       // mid speed
    scale: 1.16,
    opacity: 0.58,
    background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.04) 100%)",
    blend: "normal",
    zIndex: 3,
  },
  {
    id: 4,
    yRange: [0, 420],       // moves the most — feels closest
    scale: 1.06,
    opacity: 0.28,
    background: "radial-gradient(circle at 70% 60%, rgba(139,92,246,0.08) 0%, transparent 60%)",
    blend: "screen",
    zIndex: 4,
  },
];

function ParallaxLayer({ layer }: { layer: Layer }) {
  // Each instance reads the global window scroll
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], layer.yRange);

  return (
    <motion.div
      style={{
        y,
        position: "absolute",
        inset: "-20% 0",          // overscan so movement never shows gaps
        zIndex: layer.zIndex,
        mixBlendMode: layer.blend as React.CSSProperties["mixBlendMode"],
        willChange: "transform",
        background: layer.background,
      }}
    />
  );
}

export function ParallaxHero() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#0F1117]"
      style={{ zIndex: 0 }}
    >
      {/* ── 4 depth layers ── */}
      {LAYERS.map((layer) => (
        <ParallaxLayer key={layer.id} layer={layer} />
      ))}

      {/* ── Brand colour overlays ── */}

      {/* Base dark tint */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        background: "rgba(15,17,23,0.52)",
      }} />

      {/* Indigo glow top-centre */}
      <div style={{
        position: "absolute", zIndex: 21,
        top: -180, left: "50%", transform: "translateX(-50%)",
        width: 1000, height: 600, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(99,102,241,0.30), transparent)",
        filter: "blur(55px)",
      }} />

      {/* Cyan teal right */}
      <div style={{
        position: "absolute", zIndex: 21,
        top: "15%", right: -100,
        width: 700, height: 500, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(20,184,166,0.16), transparent)",
        filter: "blur(60px)",
      }} />

      {/* Emerald bottom-right */}
      <div style={{
        position: "absolute", zIndex: 21,
        bottom: -100, right: -80,
        width: 650, height: 480, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(16,185,129,0.18), transparent)",
        filter: "blur(55px)",
      }} />

      {/* Violet bottom-left */}
      <div style={{
        position: "absolute", zIndex: 21,
        bottom: "10%", left: -120,
        width: 580, height: 440, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(139,92,246,0.16), transparent)",
        filter: "blur(55px)",
      }} />

      {/* Top fade for nav */}
      <div style={{
        position: "absolute", zIndex: 22,
        top: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(to bottom, rgba(15,17,23,0.90) 0%, transparent 100%)",
      }} />

      {/* Bottom fade for lower sections */}
      <div style={{
        position: "absolute", zIndex: 22,
        bottom: 0, left: 0, right: 0, height: 380,
        background: "linear-gradient(to top, #0F1117 0%, transparent 100%)",
      }} />

      {/* Film grain */}
      <svg
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          zIndex: 23, opacity: 0.038,
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="campus-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#campus-grain)" />
      </svg>
    </div>
  );
}

export default ParallaxHero;
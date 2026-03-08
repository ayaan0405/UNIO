"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

export function ParallaxBg() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "0% 0%",
          end: "200% 0%",
          scrub: 1
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        const layerElements = triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`);
        if (layerElements.length > 0) {
          tl.to(
            layerElements,
            {
              yPercent: layerObj.yPercent,
              ease: "none"
            },
            idx === 0 ? undefined : "<"
          );
        }
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up GSAP and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (triggerElement) {
        gsap.killTweensOf(triggerElement);
      }
      lenis.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
      <div ref={parallaxRef}>
        <div data-parallax-layers className="relative w-full h-full">
          {/* LAYER 1 - Deep space / night sky */}
          <img 
            src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80" 
            data-parallax-layer="1"
            alt="Deep space night sky"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          
          {/* LAYER 2 - Abstract indigo/purple light bokeh */}
          <img 
            src="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1920&q=80" 
            data-parallax-layer="2"
            alt="Abstract indigo purple light bokeh"
            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen"
          />
          
          {/* LAYER 3 - Soft emerald/teal light glow */}
          <img 
            src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80" 
            data-parallax-layer="3"
            alt="Soft emerald teal light glow"
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-screen"
          />
          
          {/* LAYER 4 - Dark subtle texture/noise */}
          <img 
            src="https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&q=80" 
            data-parallax-layer="4"
            alt="Dark subtle texture noise"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1117]/80 via-[#0F1117]/40 to-[#0F1117]/90" />
        </div>
      </div>
    </div>
  );
}

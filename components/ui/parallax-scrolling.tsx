'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

export function ParallaxScrolling() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
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
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow"></div>
          <div data-parallax-layers className="parallax__layers">
            <img 
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800" 
              loading="eager" 
              width="800" 
              data-parallax-layer="1" 
              alt="Campus Event" 
              className="parallax__layer-img" 
            />
            <img 
              src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800" 
              loading="eager" 
              width="800" 
              data-parallax-layer="2" 
              alt="Event Management" 
              className="parallax__layer-img" 
            />
            <div data-parallax-layer="3" className="parallax__layer-title">
              <h2 className="parallax__title">UNIO Campus Events</h2>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1540575861501-7ad05a639b3a?auto=format&fit=crop&q=80&w=800" 
              loading="eager" 
              width="800" 
              data-parallax-layer="4" 
              alt="Event Analytics" 
              className="parallax__layer-img" 
            />
          </div>
          <div className="parallax__fade"></div>
        </div>
      </section>
      <section className="parallax__content">
        <div className="max-w-4xl mx-auto px-8 py-20 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Transform Your Campus Events
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
            Experience seamless event management with real-time updates, instant check-ins, and powerful analytics.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-semibold transition-colors">
              Get Started Free
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold border border-white/20 transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

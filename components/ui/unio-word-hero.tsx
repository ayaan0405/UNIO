'use client';

import { useEffect } from 'react';

type Theme = 'system' | 'light' | 'dark';

export type UnioWordHeroProps = {
  items?: string[];
  showFooter?: boolean;
  theme?: Theme;
  animate?: boolean;
  hue?: number;
  startVh?: number;
  spaceVh?: number;
  debug?: boolean;
  taglineHTML?: string;
};

export function UnioWordHero({
  items = [
    'create.',
    'manage.',
    'check in.',
    'notify.',
    'track.',
    'celebrate.',
    'go live.',
  ],
  showFooter = false,
  theme = 'dark',
  animate = true,
  hue = 245,           // indigo hue — matches UNIO #6366F1
  startVh = 50,
  spaceVh = 50,
  debug = false,
  taglineHTML = `and UNIO handles the rest.<br /><a href="#">start your campus story.</a>`,
}: UnioWordHeroProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.animate = String(animate);
    root.dataset.debug = String(debug);
    root.style.setProperty('--hue', String(hue));
    root.style.setProperty('--start', `${startVh}vh`);
    root.style.setProperty('--space', `${spaceVh}vh`);
  }, [theme, animate, debug, hue, startVh, spaceVh]);

  return (
    <div
      className="unio-word-hero w-screen"
      style={{ ['--count' as any]: items.length } as React.CSSProperties}
    >
      <header className="content fluid">
        <section className="content">
          {/* Screen-reader text */}
          <h1 className="sr-only sm:not-sr-only">
            <span aria-hidden="true">your campus can&nbsp;</span>
            <span className="sr-only">your campus can go live.</span>
          </h1>

          {/* Cycling words */}
          <ul aria-hidden="true">
            {items.map((word, i) => (
              <li key={i} style={{ ['--i' as any]: i } as React.CSSProperties}>
                {word}
              </li>
            ))}
          </ul>
        </section>
      </header>

      <main>
        <section>
          <p
            className="fluid"
            dangerouslySetInnerHTML={{ __html: taglineHTML }}
          />
        </section>
      </main>

      {showFooter && (
        <footer>
          UNIO Campus &copy; {new Date().getFullYear()} · Where campus events come alive.
        </footer>
      )}

      <style jsx global>{`
        @layer base, stick, demo, debug;

        .unio-word-hero {
          --start: 50vh;
          --space: 50vh;
          /* indigo accent overrides the default purple */
          --hue: 245;
          --accent: hsl(var(--hue) 85% 68%);   /* #818cf8 indigo-400 */
          --accent-alt: hsl(158 64% 52%);       /* #10B981 emerald */
          color-scheme: dark only;
        }

        /* ── sticky header ── */
        .unio-word-hero header {
          --font-level: 4;
          --font-size-min: 28;
          position: sticky;
          top: calc((var(--count) - 1) * -1lh);
          line-height: 1.2;
          display: flex;
          align-items: start;
          width: 100%;
          margin-bottom: var(--space);
          z-index: 10;
        }

        .unio-word-hero header section:first-of-type {
          display: flex;
          width: 100%;
          align-items: start;
          justify-content: center;
          padding-top: calc(var(--start) - 0.5lh);
        }

        .unio-word-hero header section:first-of-type h1 {
          position: sticky;
          top: calc(var(--start) - 0.5lh);
          margin: 0;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          letter-spacing: -0.03em;
        }

        /* "your campus can" prefix — white/25 */
        .unio-word-hero header section:first-of-type h1 span[aria-hidden] {
          color: rgba(255,255,255,0.25);
        }

        /* cycling word list */
        .unio-word-hero ul {
          font-weight: 700;
          list-style: none;
          padding: 0;
          margin: 0;
          letter-spacing: -0.03em;
        }

        /* each word — colour band highlight at scroll midpoint */
        .unio-word-hero li {
          --dimmed: rgba(255,255,255,0.15);
          background:
            linear-gradient(
              180deg,
              var(--dimmed)   0 calc(var(--start) - 0.5lh),
              var(--accent)   calc(var(--start) - 0.55lh) calc(var(--start) + 0.55lh),
              var(--dimmed)   calc(var(--start) + 0.5lh)
            );
          background-attachment: fixed;
          color: #0000;
          background-clip: text;
          -webkit-background-clip: text;
          transition: background 0.1s;
        }

        /* alternate emerald for even items */
        .unio-word-hero li:nth-child(even) {
          --accent: hsl(158 64% 52%);
        }

        /* ── main reveal panel ── */
        .unio-word-hero main {
          width: 100%;
          height: 100vh;
          position: relative;
          z-index: 2;
          color: white;
        }

        .unio-word-hero main::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          /* dark navy panel, matches UNIO bg */
          background: rgba(15,17,23,0.96);
          backdrop-filter: blur(24px);
          border-radius: 1.5rem 1.5rem 0 0;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .unio-word-hero main section {
          --font-level: 4;
          --font-size-min: 20;
          height: 100%;
          width: 100%;
          display: flex;
          place-items: center;
          justify-content: center;
          text-align: center;
        }

        .unio-word-hero main section p {
          margin: 0;
          font-weight: 700;
          white-space: nowrap;
          letter-spacing: -0.03em;
          color: rgba(255,255,255,0.85);
          line-height: 1.5;
        }

        /* the CTA link in the tagline */
        .unio-word-hero main section a {
          color: hsl(245 85% 68%);   /* indigo */
          text-decoration: none;
          text-underline-offset: 0.1lh;
        }
        .unio-word-hero main section a:hover {
          text-decoration: underline;
          color: hsl(158 64% 52%);   /* emerald on hover */
        }

        /* ── fluid type helper ── */
        .unio-word-hero .fluid {
          --font-size-min: 14;
          --font-size-max: 20;
          --font-ratio-min: 1.1;
          --font-ratio-max: 1.33;
          --font-width-min: 375;
          --font-width-max: 1500;
          --fluid-min: calc(var(--font-size-min) * pow(var(--font-ratio-min), var(--font-level, 0)));
          --fluid-max: calc(var(--font-size-max) * pow(var(--font-ratio-max), var(--font-level, 0)));
          --fluid-preferred: calc((var(--fluid-max) - var(--fluid-min)) / (var(--font-width-max) - var(--font-width-min)));
          --fluid-type: clamp(
            (var(--fluid-min) / 16) * 1rem,
            ((var(--fluid-min) / 16) * 1rem)
              - (((var(--fluid-preferred) * var(--font-width-min)) / 16) * 1rem)
              + (var(--fluid-preferred) * 100vi),
            (var(--fluid-max) / 16) * 1rem
          );
          font-size: var(--fluid-type);
        }

        /* ── view-timeline progressive enhancement ── */
        @supports (animation-timeline: view()) {
          [data-animate='true'] .unio-word-hero main {
            view-timeline: --unio-section;
          }
          [data-animate='true'] .unio-word-hero main::before {
            transform-origin: 50% 100%;
            scale: 0.94;
            animation: unio-grow both ease-in-out;
            animation-timeline: --unio-section;
            animation-range: entry 50%;
          }
          [data-animate='true'] .unio-word-hero main section p {
            position: fixed;
            top: 50%;
            left: 50%;
            translate: -50% -50%;
            animation: unio-reveal both ease-in-out;
            animation-timeline: --unio-section;
            animation-range: entry 50%;
          }
          @keyframes unio-reveal {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes unio-grow {
            to { scale: 1; border-radius: 0; }
          }
        }

        /* ── footer ── */
        .unio-word-hero footer {
          padding-block: 2rem;
          font-size: 0.8rem;
          font-weight: 400;
          color: rgba(255,255,255,0.25);
          text-align: center;
          width: 100%;
          background: rgba(15,17,23,0.98);
          letter-spacing: 0.05em;
        }

        /* sr-only util (scoped) */
        .unio-word-hero .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
      `}</style>
    </div>
  );
}

export default UnioWordHero;
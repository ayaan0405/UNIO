import { ParallaxScrolling } from '@/components/ui/parallax-scrolling';

export default function ParallaxDemo() {
  return (
    <>
      <ParallaxScrolling />
      <div className="text-center py-8 text-white/50">
        <p className="text-sm">
          Powered by{' '}
          <a 
            href="https://www.osmo.supply/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Osmo
          </a>
        </p>
      </div>
    </>
  );
}

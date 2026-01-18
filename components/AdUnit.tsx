import React, { useEffect, useRef, useState } from 'react';

type AdType = 'display' | 'in-feed' | 'in-article' | 'multiplex';

interface AdUnitProps {
  type: AdType;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const PUB_ID = "ca-pub-5777913995990269";

export const AdUnit: React.FC<AdUnitProps> = ({ type, className = "" }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // Prevent double injection if already loaded for this instance
    if (isAdLoaded) return;

    const element = adRef.current;
    if (!element) return;

    // Use IntersectionObserver to ensure ad is only pushed when visible AND has dimensions
    // This fixes the "No slot size for availableWidth=0" error
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        // Only trigger if intersecting viewport AND has explicit width > 0
        if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
          try {
            // Double check to prevent multiple pushes for same slot
            const ads = (window.adsbygoogle = window.adsbygoogle || []);
            // Check if this specific element already has the ad-status attribute (set by AdSense)
            // or if we have marked it as loaded.
            const insElement = element.querySelector('ins');
            if (insElement && !insElement.getAttribute('data-ad-status')) {
                ads.push({});
                setIsAdLoaded(true);
            }
            
            // We only need to load once, so stop observing
            observer.disconnect();
          } catch (err) {
            console.debug("AdSense load skipped:", err);
          }
        }
      },
      { 
        rootMargin: '200px', // Start loading when user is 200px away
        threshold: 0.01      // Trigger when 1% of the element is visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isAdLoaded]);

  const AdLabel = () => (
    <div className="w-full text-center pb-2">
      <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Advertisement</span>
    </div>
  );

  // Robust wrapper with default dimensions to prevent layout shift and 0-height errors
  const baseWrapperClass = `w-full overflow-hidden bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 my-6 ${className}`;

  if (type === 'display') {
    return (
      <div className={baseWrapperClass} ref={adRef} style={{ minHeight: '280px' }}>
        <AdLabel />
        <div className="flex justify-center w-full min-h-[250px] bg-slate-950/20 rounded-xl overflow-hidden">
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client={PUB_ID}
                data-ad-slot="7886420725"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
      </div>
    );
  }

  if (type === 'in-feed') {
    return (
      <div className="w-full my-4 p-2 bg-slate-900 rounded-3xl border border-slate-800" ref={adRef} style={{ minHeight: '120px' }}>
        <div className="px-4 pt-2">
            <span className="text-[10px] uppercase text-slate-600 font-bold">Sponsored</span>
        </div>
        <div className="min-h-[100px] w-full">
            <ins className="adsbygoogle"
                 style={{ display: 'block', width: '100%' }}
                 data-ad-format="fluid"
                 data-ad-layout-key="-fb+5w+4e-db+86"
                 data-ad-client={PUB_ID}
                 data-ad-slot="1358323785"></ins>
        </div>
      </div>
    );
  }

  if (type === 'in-article') {
    return (
      <div className="w-full my-12 relative group" ref={adRef} style={{ minHeight: '300px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-pink-900/10 rounded-2xl -z-10 blur-xl opacity-50"></div>
        <div className="border-y border-slate-800 py-8 text-center w-full">
            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-4 block">Sponsored Content</span>
            <div className="min-h-[250px] w-full">
                <ins className="adsbygoogle"
                     style={{ display: 'block', textAlign: 'center', width: '100%' }}
                     data-ad-layout="in-article"
                     data-ad-format="fluid"
                     data-ad-client={PUB_ID}
                     data-ad-slot="8829619693"></ins>
            </div>
        </div>
      </div>
    );
  }

  if (type === 'multiplex') {
    return (
      <div className={baseWrapperClass} ref={adRef} style={{ minHeight: '400px' }}>
        <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">You might also like</span>
        </div>
        <div className="w-full min-h-[350px]">
           <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-format="autorelaxed"
                data-ad-client={PUB_ID}
                data-ad-slot="1836195301"></ins>
        </div>
      </div>
    );
  }

  return null;
};
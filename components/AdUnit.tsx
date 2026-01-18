import React, { useEffect } from 'react';

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
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error", err);
    }
  }, []);

  const AdLabel = () => (
    <div className="w-full text-center pb-2">
      <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Advertisement</span>
    </div>
  );

  // Wrapper style to make it look intentional and part of the design
  const wrapperClass = `w-full overflow-hidden bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 my-6 ${className}`;

  if (type === 'display') {
    return (
      <div className={wrapperClass}>
        <AdLabel />
        <div className="flex justify-center min-h-[100px]">
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
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
      <div className="w-full my-4 p-2 bg-slate-900 rounded-3xl border border-slate-800">
        <div className="px-4 pt-2">
            <span className="text-[10px] uppercase text-slate-600 font-bold">Sponsored</span>
        </div>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-format="fluid"
             data-ad-layout-key="-fb+5w+4e-db+86"
             data-ad-client={PUB_ID}
             data-ad-slot="1358323785"></ins>
      </div>
    );
  }

  if (type === 'in-article') {
    return (
      <div className="w-full my-12 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-pink-900/10 rounded-2xl -z-10 blur-xl opacity-50"></div>
        <div className="border-y border-slate-800 py-8 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-4 block">Sponsored Content</span>
            <ins className="adsbygoogle"
                 style={{ display: 'block', textAlign: 'center' }}
                 data-ad-layout="in-article"
                 data-ad-format="fluid"
                 data-ad-client={PUB_ID}
                 data-ad-slot="8829619693"></ins>
        </div>
      </div>
    );
  }

  if (type === 'multiplex') {
    return (
      <div className={wrapperClass}>
        <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">You might also like</span>
        </div>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-format="autorelaxed"
             data-ad-client={PUB_ID}
             data-ad-slot="1836195301"></ins>
      </div>
    );
  }

  return null;
};
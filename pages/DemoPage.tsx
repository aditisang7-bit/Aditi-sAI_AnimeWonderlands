import React, { useState } from 'react';
import { SAMPLE_IMAGE, SAMPLE_VIDEO_PROMPT } from '../constants';
import { Sparkles, Play, CheckCircle } from 'lucide-react';

export const DemoPage: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<'avatar' | 'caption'>('avatar');

  const runDemo = () => {
    setProcessing(true);
    setResult(null);
    // Simulate API delay
    setTimeout(() => {
      setProcessing(false);
      if (activeDemo === 'avatar') {
        setResult("https://picsum.photos/id/64/500/500?grayscale"); // Simulating a change
      } else {
        setResult("1. UNBELIEVABLE Transformation! 😱 #Success\n2. From Now to Future Self 🚀 #Motivation\n3. The AI Miracle You Need To See ✨");
      }
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Instant Demo</h1>
        <p className="text-slate-400">Experience the power of Aditi’s AI without signing up.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar Controls */}
        <div className="md:col-span-1 space-y-4">
          <button 
            onClick={() => { setActiveDemo('avatar'); setResult(null); }}
            className={`w-full p-4 rounded-xl text-left border transition-all ${activeDemo === 'avatar' ? 'bg-purple-900/20 border-purple-500' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
          >
            <div className="font-semibold mb-1">Avatar Generator</div>
            <div className="text-xs text-slate-400">Transform image to future self</div>
          </button>
          
          <button 
             onClick={() => { setActiveDemo('caption'); setResult(null); }}
             className={`w-full p-4 rounded-xl text-left border transition-all ${activeDemo === 'caption' ? 'bg-purple-900/20 border-purple-500' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
          >
            <div className="font-semibold mb-1">Caption Writer</div>
            <div className="text-xs text-slate-400">Generate viral hooks</div>
          </button>
        </div>

        {/* Preview Area */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="mb-6">
             <div className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Input</div>
             <div className="flex items-center space-x-4">
               <img src={SAMPLE_IMAGE} alt="Sample" className="w-24 h-24 object-cover rounded-lg border border-slate-700" />
               <div className="flex-1">
                 <p className="text-sm text-slate-300 italic">"Transform this person into their future successful self..."</p>
               </div>
             </div>
          </div>

          <div className="border-t border-slate-800 my-6"></div>

          <div className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Output</div>
          
          <div className="min-h-[200px] flex flex-col items-center justify-center bg-slate-950 rounded-xl border border-dashed border-slate-800 relative overflow-hidden">
             {processing ? (
               <div className="flex flex-col items-center space-y-3 animate-pulse">
                 <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-sm text-purple-400">AI is thinking...</p>
               </div>
             ) : result ? (
                activeDemo === 'avatar' ? (
                  <img src={result} alt="Result" className="w-full h-full object-contain max-h-[300px]" />
                ) : (
                  <div className="p-6 w-full text-left">
                    <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm">{result}</pre>
                    <button className="mt-4 text-xs text-purple-400 flex items-center space-x-1 hover:text-purple-300">
                      <CheckCircle size={12} /> <span>Copied to clipboard</span>
                    </button>
                  </div>
                )
             ) : (
               <div className="text-center p-6">
                 <p className="text-slate-500 text-sm mb-4">Ready to generate</p>
                 <button 
                  onClick={runDemo}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
                 >
                   <Sparkles size={16} />
                   <span>Generate Demo</span>
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
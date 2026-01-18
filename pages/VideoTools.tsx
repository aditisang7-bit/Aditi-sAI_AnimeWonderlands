import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { analyzeVideo, generateVeoVideo, generateSpeech, playRawAudio } from '../services/geminiService';
import { PROMPTS } from '../constants';
import { Loader2, Clapperboard, Type, Copy, Video as VideoIcon, Megaphone, Mic, Play, Film, Ratio } from 'lucide-react';

type ToolType = 'CAPTION' | 'IMG_TO_VIDEO' | 'AD_STUDIO';
type AdStyle = 'UGC' | 'ANIMATED';
type AspectRatio = '16:9' | '9:16';

export const VideoTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('IMG_TO_VIDEO');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [resultAudio, setResultAudio] = useState<string | null>(null); // Base64 audio
  const [error, setError] = useState<string | null>(null);

  // Tool Specific States
  const [adStyle, setAdStyle] = useState<AdStyle>('UGC');
  const [adScript, setAdScript] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResultText(null);
    setResultVideo(null);
    setResultAudio(null);

    try {
      if (activeTool === 'CAPTION') {
        if (!file) throw new Error("Upload video for analysis");
        const text = await analyzeVideo(PROMPTS.CAPTION, file);
        setResultText(text);
      } 
      else if (activeTool === 'AD_STUDIO') {
        if (!file) throw new Error("Please upload a product or reference image.");
        
        // 1. Generate Video
        const promptBase = adStyle === 'UGC' ? PROMPTS.AD_UGC_BASE : PROMPTS.AD_ANIMATED_BASE;
        const finalPrompt = `${promptBase} ${adScript.substring(0, 100)}`; // Use part of script as context
        
        // Start Video Generation (Ads usually vertical 9:16)
        const videoPromise = generateVeoVideo(finalPrompt, file, '9:16'); 
        
        // 2. Generate Audio (TTS) if script provided
        let audioPromise = Promise.resolve(null as string | null);
        if (adScript.trim()) {
           audioPromise = generateSpeech(adScript);
        }

        const [videoUrl, audioBase64] = await Promise.all([videoPromise, audioPromise]);
        
        setResultVideo(videoUrl);
        setResultAudio(audioBase64);
      } 
      else if (activeTool === 'IMG_TO_VIDEO') {
        if (!file) throw new Error("Please upload a reference image.");
        
        // General Image to Video
        const finalPrompt = videoPrompt.trim() || PROMPTS.VIDEO_DEFAULT;
        const videoUrl = await generateVeoVideo(finalPrompt, file, aspectRatio);
        setResultVideo(videoUrl);
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video & Ad Studio</h1>
          <p className="text-slate-400">Generate viral captions, motion videos, and full ads.</p>
        </div>
        
        <div className="bg-slate-900 p-1 rounded-lg inline-flex border border-slate-800">
          <button 
            onClick={() => { setActiveTool('IMG_TO_VIDEO'); setError(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeTool === 'IMG_TO_VIDEO' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Film size={16} />
            <span>Image to Video</span>
          </button>
           <button 
            onClick={() => { setActiveTool('AD_STUDIO'); setError(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeTool === 'AD_STUDIO' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Megaphone size={16} />
            <span>Ad Creator</span>
          </button>
          <button 
            onClick={() => { setActiveTool('CAPTION'); setError(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeTool === 'CAPTION' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Type size={16} />
            <span>Captions</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* --- INPUT COLUMN --- */}
        <div className="space-y-6">
          
          {/* Ad Studio specific controls */}
          {activeTool === 'AD_STUDIO' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Megaphone className="text-purple-400" size={20} /> Ad Configuration
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAdStyle('UGC')}
                  className={`p-3 rounded-xl border text-left transition-all ${adStyle === 'UGC' ? 'bg-purple-900/20 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="font-bold text-sm mb-1">UGC Style</div>
                  <div className="text-xs opacity-70">Influencer vibe, handheld, authentic.</div>
                </button>
                <button 
                  onClick={() => setAdStyle('ANIMATED')}
                  className={`p-3 rounded-xl border text-left transition-all ${adStyle === 'ANIMATED' ? 'bg-purple-900/20 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="font-bold text-sm mb-1">3D Animated</div>
                  <div className="text-xs opacity-70">Cinematic, studio lighting, high production.</div>
                </button>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Voiceover Script & Context</label>
                 <textarea 
                    value={adScript}
                    onChange={(e) => setAdScript(e.target.value)}
                    placeholder="Enter the script you want the AI to narrate. This also guides the video context."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none h-32 resize-none"
                 />
              </div>
            </div>
          )}

          {/* Image to Video Specific Controls */}
          {activeTool === 'IMG_TO_VIDEO' && (
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fade-in">
               <h3 className="font-semibold text-white flex items-center gap-2">
                <Film className="text-purple-400" size={20} /> Video Settings
               </h3>

               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Motion Prompt</label>
                 <textarea 
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="e.g., 'camera pans left', 'zoom in', 'character waves'..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none h-24 resize-none"
                 />
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Ratio size={14} /> Aspect Ratio
                 </label>
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setAspectRatio('16:9')}
                     className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${aspectRatio === '16:9' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                   >
                     <span className="font-bold">16:9</span>
                     <span className="text-[10px] opacity-60">Landscape</span>
                   </button>
                   <button 
                     onClick={() => setAspectRatio('9:16')}
                     className={`py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${aspectRatio === '9:16' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                   >
                     <span className="font-bold">9:16</span>
                     <span className="text-[10px] opacity-60">Portrait</span>
                   </button>
                 </div>
               </div>
             </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-white">
              {activeTool === 'AD_STUDIO' ? '2. Upload Product / Reference' : activeTool === 'IMG_TO_VIDEO' ? '1. Upload Model / Image' : '1. Upload Asset'}
            </h3>
             <FileUpload 
              accept={activeTool === 'CAPTION' ? "video/*" : "image/*"} 
              onFileSelect={setFile} 
              icon={activeTool === 'CAPTION' ? 'video' : 'image'}
              label={
                activeTool === 'CAPTION' ? "Upload Video for Captions" : 
                activeTool === 'IMG_TO_VIDEO' ? "Upload Model or Scene Photo" : 
                "Upload Reference Image"
              }
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
              loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/50'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Processing Video...</span>
              </>
            ) : (
              <>
                <Clapperboard />
                <span>
                  {activeTool === 'CAPTION' ? 'Generate Captions' : activeTool === 'AD_STUDIO' ? 'Create Ad Campaign' : 'Generate Video'}
                </span>
              </>
            )}
          </button>
           {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-start gap-2">
                <div className="mt-0.5 min-w-[16px]">⚠️</div>
                <div>{error}</div>
              </div>
            )}
        </div>

        {/* --- OUTPUT COLUMN --- */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
          <h3 className="font-semibold mb-4 text-white">Output Studio</h3>
          
          <div className="flex-1 rounded-xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center p-4 overflow-hidden relative">
             {/* CAPTIONS RESULT */}
             {activeTool === 'CAPTION' && resultText && (
               <div className="w-full h-full overflow-y-auto pr-2">
                 <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                   {resultText}
                 </pre>
                 <button className="mt-4 flex items-center space-x-2 text-purple-400 text-sm font-medium hover:text-purple-300" onClick={() => navigator.clipboard.writeText(resultText)}>
                   <Copy size={16} /> <span>Copy to Clipboard</span>
                 </button>
               </div>
             )}

             {/* VEO VIDEO RESULT (AD OR IMG_TO_VIDEO) */}
             {(activeTool === 'IMG_TO_VIDEO' || activeTool === 'AD_STUDIO') && resultVideo && (
               <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-full rounded-lg overflow-hidden shadow-2xl border border-slate-800 bg-black">
                    <video 
                      controls 
                      autoPlay 
                      loop 
                      className={`w-full h-auto max-h-[400px] mx-auto ${aspectRatio === '9:16' ? 'max-w-[250px]' : 'max-w-full'}`} 
                      src={resultVideo} 
                    />
                  </div>
                  
                  {/* Audio Player for Ads */}
                  {resultAudio && (
                    <div className="w-full max-w-sm bg-slate-800 p-3 rounded-lg flex items-center justify-between">
                       <div className="flex items-center space-x-2 text-slate-300 text-sm">
                         <Mic size={16} />
                         <span>Voiceover Generated</span>
                       </div>
                       <button 
                        onClick={() => playRawAudio(resultAudio)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-full flex items-center space-x-1"
                       >
                         <Play size={12} fill="currentColor" /> <span>Play Audio</span>
                       </button>
                    </div>
                  )}

                  <a 
                    href={resultVideo} 
                    download={`aditi-veo-${Date.now()}.mp4`}
                    className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors flex items-center space-x-2"
                  >
                    <VideoIcon size={18} /> <span>Download MP4</span>
                  </a>
               </div>
             )}

             {!resultText && !resultVideo && !loading && (
               <div className="text-center text-slate-500">
                 <Film className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p className="font-medium">Ready to Create</p>
                 <p className="text-xs mt-2 opacity-50 max-w-xs mx-auto">Upload an image and set your motion prompts to generate cinematic AI video.</p>
               </div>
             )}
              
              {loading && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-6 z-10">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clapperboard size={24} className="text-purple-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">Generating Veo Video...</p>
                    <p className="text-slate-400 text-sm mt-1">This may take 30-60 seconds</p>
                    <p className="text-xs text-slate-500 mt-4 max-w-xs mx-auto">Please do not close this tab. The AI is rendering frame by frame.</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
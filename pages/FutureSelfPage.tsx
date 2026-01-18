import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { generateImageTool } from '../services/geminiService';
import { PROMPTS } from '../constants';
import { Sparkles, Wand2, Loader2, Download, Share2, ArrowRight } from 'lucide-react';

export const FutureSelfPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [goals, setGoals] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!file || !goals) return;
    setIsGenerating(true);
    
    try {
      const fullPrompt = `${PROMPTS.FUTURE_SELF_ANIME} User Goals: ${goals}`;
      const images = await generateImageTool('gemini-2.5-flash-image', fullPrompt, file);
      setResultImage(images[0]);
    } catch (e) {
      console.error(e);
      alert("Failed to contact the Anime Architect AI. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          FUTURE SELF AI
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Upload your photo and tell us your dreams. Our AI will paint your legendary future in anime style.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* INPUT SECTION */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs">1</span>
              Upload Current Self
            </h3>
            <FileUpload accept="image/*" onFileSelect={setFile} label="Upload Selfie" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs">2</span>
              Define Your Destiny
            </h3>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., I want to be a tech CEO living in Tokyo, confident, wearing cyberpunk streetwear..."
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-pink-500 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !file || !goals}
            className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all ${
              isGenerating || !file || !goals
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-xl shadow-pink-900/40 hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Manifesting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Wand2 /> Visualize Future
              </span>
            )}
          </button>
        </div>

        {/* OUTPUT SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden group">
          {resultImage ? (
            <>
              <img src={resultImage} alt="Future Self" className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Legendary Status Achieved</h3>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200">
                    <Download size={18} /> Save
                  </button>
                  <button className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-pink-500">
                    <Share2 size={18} /> Post to Feed
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8 opacity-50">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <p className="font-bold text-lg">Your future awaits...</p>
              <p className="text-sm">Complete the steps on the left to unlock your potential.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
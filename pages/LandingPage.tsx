import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { 
  Gamepad2, User, Play, Star, Search, Mic, Camera, ArrowRight, 
  Sparkles, Image as ImageIcon, Video, FileText, Bot
} from 'lucide-react';
import { AdUnit } from '../components/AdUnit';
import { SEO } from '../components/SEO';
import { playUiSound } from '../services/audioTheme';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    playUiSound('activate');
    const lower = query.toLowerCase();

    // Intent Detection Logic
    if (
        (lower.includes('generate') || lower.includes('create') || lower.includes('draw') || lower.includes('make') || lower.startsWith('image') || lower.startsWith('photo')) &&
        (lower.includes('image') || lower.includes('picture') || lower.includes('photo') || lower.includes('art') || lower.includes('logo') || lower.includes('avatar') || lower.includes('wallpaper'))
    ) {
         navigate(AppRoute.IMAGE_DASHBOARD, { state: { autoGenPrompt: query } });
         return;
    }

    if (lower.includes('video') || lower.includes('movie') || lower.includes('clip') || lower.includes('animate')) {
        navigate(AppRoute.VIDEO_TOOLS, { state: { autoGenPrompt: query } });
        return;
    }
    
    if (lower.includes('summarize') || lower.includes('analyze document') || lower.includes('check plagiarism')) {
        navigate(AppRoute.DOC_TOOLS, { state: { autoGenPrompt: query } });
        return;
    }

    navigate(AppRoute.AI_ASSISTANT, { state: { initialQuery: query, autoSend: true } });
  };

  const startVoice = () => {
    playUiSound('click');
    navigate(AppRoute.AI_ASSISTANT, { state: { startVoice: true } });
  };
  
  const startCamera = () => {
    playUiSound('click');
    navigate(AppRoute.AI_ASSISTANT, { state: { startCamera: true } });
  };

  const QUICK_ACTIONS = [
    { label: "Generate Avatar", icon: <User size={14} />, query: "Create an anime avatar based on a description" },
    { label: "Play Ludo", icon: <Gamepad2 size={14} />, route: null, isComingSoon: true },
    { label: "Analyze Doc", icon: <FileText size={14} />, route: AppRoute.DOC_TOOLS },
    { label: "Create Video", icon: <Video size={14} />, route: AppRoute.VIDEO_TOOLS },
    { label: "Ask AI", icon: <Bot size={14} />, route: AppRoute.AI_ASSISTANT },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-12 px-4">
      <SEO 
        title="Aditi's AI - #1 Anime Art Generator & Ludo Game | Pune"
        description="Create stunning Anime Art, play multiplayer Anime Ludo, and use powerful AI tools. The ultimate creative platform based in Thergaon, Pune."
        keywords="Anime AI, Ludo Game, Pune AI, Image Generator, Free AI Tools"
      />
      
      {/* Search Hero Section */}
      <section className="pt-20 pb-10 flex flex-col items-center relative z-10">
        
        {/* Decorative Blur Behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-slate-300 text-xs font-bold mb-4 animate-fade-in backdrop-blur-sm">
            <Star size={12} className="text-yellow-400" fill="currentColor" />
            <h2 className="inline">AI-Powered Creative Ecosystem in India</h2>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">create</span> today?
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            The all-in-one platform for Anime Art Generation, Online Ludo Gaming, and Content Creation. Built for creators in Pune and beyond.
          </p>
        </div>

        {/* Universal Search Bar */}
        <div className="w-full max-w-3xl relative group z-20">
           {/* Animated Glow Border */}
           <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 will-change-transform"></div>
           
           <div className="relative bg-slate-900 border border-slate-700 rounded-2xl flex items-center p-2 shadow-2xl transition-all focus-within:border-purple-500 focus-within:bg-slate-900/90 focus-within:scale-[1.01]">
              <Search className="ml-4 text-slate-400 shrink-0" size={24} />
              <input 
                 className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 text-lg px-4 py-4 font-medium"
                 placeholder="Search tools, ask questions, or generate art..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSearch()}
                 autoFocus
                 aria-label="Search Aditi's AI Tools"
              />
              <div className="flex items-center gap-2 pr-2 shrink-0">
                 <button 
                   onClick={startVoice}
                   title="Voice Search"
                   className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors tooltip"
                   aria-label="Voice Search"
                 >
                   <Mic size={22} />
                 </button>
                 <button 
                   onClick={startCamera}
                   title="Lens / Camera Search"
                   className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                   aria-label="Camera Search"
                 >
                   <Camera size={22} />
                 </button>
                 <button 
                   onClick={() => handleSearch()}
                   className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors shadow-lg shadow-purple-900/20 active:scale-95 transform"
                   aria-label="Submit Search"
                 >
                   <ArrowRight size={22} />
                 </button>
              </div>
           </div>
        </div>

        {/* Quick Action Chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {QUICK_ACTIONS.map((action, i) => (
             <button
               key={i}
               onClick={() => {
                 if (action.isComingSoon) return;
                 playUiSound('click');
                 if (action.route) navigate(action.route);
                 else if (action.query) navigate(AppRoute.AI_ASSISTANT, { state: { initialQuery: action.query, autoSend: true } });
               }}
               onMouseEnter={() => !action.isComingSoon && playUiSound('hover')}
               className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm font-medium transition-all ${
                 action.isComingSoon 
                   ? 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed' 
                   : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white hover:-translate-y-0.5'
               }`}
             >
               {action.icon}
               <span>{action.label}</span>
               {action.isComingSoon && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold">SOON</span>}
             </button>
          ))}
        </div>
      </section>

      {/* Ad Placement */}
      <AdUnit type="in-article" />

      {/* Feature Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        
        {/* LUDO CARD - DISABLED */}
        <div className="block group relative cursor-not-allowed opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 h-full relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">COMING SOON</div>
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity">
              <Gamepad2 size={100} />
            </div>
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
              <Gamepad2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Anime Ludo</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Battle friends or AI bots in a cyberpunk arena. Earn WonderCoins and unlock legendary skins. Best Ludo game in India.</p>
          </div>
        </div>

        <Link 
          to={AppRoute.FUTURE_SELF} 
          className="block group"
          onMouseEnter={() => playUiSound('hero_hover')}
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-colors h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Sparkles size={100} />
            </div>
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors text-slate-400">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Future Self AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Visualize your success. Our AI transforms your photos into your ideal anime protagonist self.</p>
          </div>
        </Link>

        <Link 
          to={AppRoute.SOCIAL_FEED} 
          className="block group"
          onMouseEnter={() => playUiSound('hero_hover')}
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-colors h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Play size={100} />
            </div>
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors text-slate-400">
              <Play size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Wonder Feed</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Share your gameplay highlights and AI art. Connect with a billion-user anime community.</p>
          </div>
        </Link>
      </section>

      {/* Tools Grid */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-purple-400" /> More Creative Tools
         </h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to={AppRoute.IMAGE_DASHBOARD} 
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-all flex flex-col items-center text-center gap-3 hover:bg-slate-800 group"
              onMouseEnter={() => playUiSound('hover')}
            >
                <ImageIcon className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-300 group-hover:text-white">Image Studio</span>
            </Link>
            <Link 
              to={AppRoute.VIDEO_TOOLS} 
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-all flex flex-col items-center text-center gap-3 hover:bg-slate-800 group"
              onMouseEnter={() => playUiSound('hover')}
            >
                <Video className="text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-300 group-hover:text-white">Video Creator</span>
            </Link>
             <Link 
              to={AppRoute.DOC_TOOLS} 
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-all flex flex-col items-center text-center gap-3 hover:bg-slate-800 group"
              onMouseEnter={() => playUiSound('hover')}
             >
                <FileText className="text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-300 group-hover:text-white">Doc AI</span>
            </Link>
             <Link 
              to={AppRoute.AI_ASSISTANT} 
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-all flex flex-col items-center text-center gap-3 hover:bg-slate-800 group"
              onMouseEnter={() => playUiSound('hover')}
             >
                <Search className="text-green-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-300 group-hover:text-white">Smart Search</span>
            </Link>
         </div>
      </section>

      {/* Bottom Ad */}
      <AdUnit type="multiplex" />
    </div>
  );
};
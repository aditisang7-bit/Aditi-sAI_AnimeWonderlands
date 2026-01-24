import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { BOOKS_LINK } from '../constants';
import { 
  Gamepad2, User, Play, Star, Search, Mic, Camera, ArrowRight, 
  Sparkles, Image as ImageIcon, Video, FileText, Bot, ShoppingBag
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

      {/* CORE FEATURES GRID (Ordered: Ludo, Future Self, Feed) */}
      <section className="grid md:grid-cols-3 gap-6 relative z-10">
        
        {/* LUDO CARD */}
        <div className="block group relative cursor-not-allowed opacity-90 transition-all duration-500">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 h-full relative overflow-hidden group-hover:border-yellow-500/50">
            <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">COMING SOON</div>
            
            {/* Background Icon */}
            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <Gamepad2 size={120} />
            </div>

            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-yellow-900/20 group-hover:scale-110 transition-transform">
              <Gamepad2 size={36} />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">Anime Ludo</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Battle friends or AI bots in a cyberpunk arena. Earn WonderCoins and unlock legendary skins. Best Ludo game in India.
            </p>
          </div>
        </div>

        {/* FUTURE SELF CARD */}
        <Link 
          to={AppRoute.FUTURE_SELF} 
          className="block group"
          onMouseEnter={() => playUiSound('hero_hover')}
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-pink-500/50 transition-colors h-full relative overflow-hidden shadow-lg hover:shadow-pink-900/10">
             <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <User size={120} />
            </div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-pink-900/20 group-hover:scale-110 transition-transform">
              <Sparkles size={36} />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">Future Self AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Visualize your success. Our AI transforms your photos into your ideal anime protagonist self.
            </p>
          </div>
        </Link>

        {/* FEED CARD */}
        <Link 
          to={AppRoute.SOCIAL_FEED} 
          className="block group"
          onMouseEnter={() => playUiSound('hero_hover')}
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-colors h-full relative overflow-hidden shadow-lg hover:shadow-indigo-900/10">
             <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <Play size={120} />
            </div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-900/20 group-hover:scale-110 transition-transform">
              <Play size={36} />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">Wonder Feed</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Share your gameplay highlights and AI art. Connect with a billion-user anime community.
            </p>
          </div>
        </Link>
      </section>

      {/* BOOKS COLLECTION BANNER (FULL RANGE) */}
      <section className="relative py-16 px-4 rounded-[3rem] my-16 group overflow-visible">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-purple-900/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            {/* Animated gradients */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent animate-[spin_60s_linear_infinite]"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 p-8">
          
          {/* LEFT: Copy & CTA */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/20 backdrop-blur-md rounded-full text-pink-300 text-xs font-bold border border-pink-500/30 mb-2 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <Sparkles size={12} className="animate-pulse" />
              <span>COMPLETE LEARNING KIT</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl">
              Books for Kids by <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Anime Wonderlands</span>
            </h2>
            
            <p className="text-lg text-slate-300 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed">
              The ultimate collection covering <strong>English, Maths, GK, EVS, Drawing, Poems, and Stories</strong>. 
              Make learning magical with anime-style illustrations that kids love.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                <span className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700 transition-colors">Maths</span>
                <span className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700 transition-colors">English</span>
                <span className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700 transition-colors">EVS</span>
                <span className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700 transition-colors">GK</span>
                <span className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700 transition-colors">Arts</span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <a 
                href={BOOKS_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => playUiSound('activate')}
                className="relative px-8 py-4 bg-white text-indigo-900 text-lg font-black rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all flex items-center gap-3 group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                <ShoppingBag size={24} className="text-indigo-600 group-hover/btn:scale-110 transition-transform" />
                <span>Grab the Collection</span>
                <ArrowRight size={20} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all text-indigo-600" />
              </a>
            </div>
          </div>
          
          {/* RIGHT: 3D Stack Visual */}
          <div className="flex-1 relative h-[500px] w-full flex items-center justify-center perspective-[2000px]">
             {/* Glowing Aura */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>

             {/* Stack Container */}
             <div className="relative transform-style-3d rotate-y-[-20deg] rotate-x-[10deg] hover:rotate-y-[-5deg] hover:rotate-x-[0deg] transition-transform duration-700 cursor-pointer">
                
                {/* Book 1: Maths (Bottom) */}
                <div className="absolute top-[60px] left-[-40px] w-[260px] h-[340px] transform translate-z-[-60px] rotate-z-[-5deg]">
                    <div className="absolute inset-0 bg-red-600 rounded-r-lg border-l-4 border-red-800 shadow-xl flex flex-col items-center justify-center">
                        <span className="text-red-900 font-black text-4xl opacity-50 rotate-[-45deg]">MATHS</span>
                    </div>
                    <div className="absolute top-[2px] right-0 w-[30px] h-[336px] bg-white transform rotate-y-[90deg] translate-x-[15px] translate-z-[-1px]"></div>
                </div>

                {/* Book 2: English */}
                <div className="absolute top-[40px] left-[-20px] w-[260px] h-[340px] transform translate-z-[-30px] rotate-z-[-2deg]">
                    <div className="absolute inset-0 bg-blue-600 rounded-r-lg border-l-4 border-blue-800 shadow-xl flex flex-col items-center justify-center">
                        <span className="text-blue-900 font-black text-4xl opacity-50 rotate-[-45deg]">ENGLISH</span>
                    </div>
                    <div className="absolute top-[2px] right-0 w-[30px] h-[336px] bg-white transform rotate-y-[90deg] translate-x-[15px] translate-z-[-1px]"></div>
                </div>

                {/* Book 3: EVS/GK */}
                <div className="absolute top-[20px] left-[0px] w-[260px] h-[340px] transform translate-z-[0px] rotate-z-[2deg]">
                    <div className="absolute inset-0 bg-green-600 rounded-r-lg border-l-4 border-green-800 shadow-xl flex flex-col items-center justify-center">
                        <span className="text-green-900 font-black text-4xl opacity-50 rotate-[-45deg]">EVS & GK</span>
                    </div>
                    <div className="absolute top-[2px] right-0 w-[30px] h-[336px] bg-white transform rotate-y-[90deg] translate-x-[15px] translate-z-[-1px]"></div>
                </div>

                {/* Book 4: Main Cover (Top) */}
                <div className="absolute top-[0px] left-[20px] w-[260px] h-[340px] transform translate-z-[30px] rotate-z-[5deg] group/book shadow-[20px_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 bg-[#ffd700] rounded-r-lg border-l-4 border-yellow-700 overflow-hidden flex flex-col p-4 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-40"></div>
                        
                        {/* Cover Art Sim */}
                        <div className="flex-1 bg-gradient-to-b from-orange-400 to-yellow-300 rounded-lg border-2 border-yellow-600/20 p-2 flex flex-col items-center text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-yellow-900 mb-1">Anime Wonderlands</div>
                            <h2 className="text-3xl font-black text-slate-900 leading-none mb-1">KIDS</h2>
                            <h3 className="text-xl font-bold text-slate-800">COLLECTION</h3>
                            
                            <div className="flex-1 w-full mt-2 relative overflow-hidden rounded bg-white/30 border border-white/50">
                                 {/* Abstract Anime Character Placeholder */}
                                 <div className="absolute bottom-[-10%] left-[10%] w-[80%] h-[80%] bg-pink-400 rounded-full blur-[2px]"></div>
                                 <div className="absolute top-[20%] right-[20%] text-yellow-600"><Star size={24} fill="currentColor"/></div>
                                 <div className="absolute bottom-[20%] left-[20%] text-blue-600"><Sparkles size={20} fill="currentColor"/></div>
                            </div>
                            
                            <div className="mt-2 text-[9px] font-bold text-slate-700 leading-tight">
                                Stories • Poems • Drawing
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-[2px] right-0 w-[30px] h-[336px] bg-white transform rotate-y-[90deg] translate-x-[15px] translate-z-[-1px] border border-slate-300"></div>
                </div>

             </div>
          </div>
        </div>
      </section>

      {/* Ad Placement */}
      <AdUnit type="in-article" />

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
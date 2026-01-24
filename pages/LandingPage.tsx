import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { BOOKS_LINK } from '../constants';
import { 
  Gamepad2, User, Play, Star, Search, Mic, Camera, ArrowRight, 
  Sparkles, Image as ImageIcon, Video, FileText, Bot, ShoppingBag,
  BookOpen, Palette, Calculator, Languages
} from 'lucide-react';
import { AdUnit } from '../components/AdUnit';
import { SEO } from '../components/SEO';
import { playUiSound } from '../services/audioTheme';

// --- SUB-COMPONENT: 3D BOOK ---
const Book3D = ({ 
  title, 
  subtitle, 
  color, 
  icon: Icon, 
  rotateClass, 
  zIndex 
}: { 
  title: string, 
  subtitle: string, 
  color: string, 
  icon: any, 
  rotateClass: string,
  zIndex: number 
}) => {
  // Color mappings
  const colors: Record<string, any> = {
    red: { front: 'bg-red-600', spine: 'bg-red-800', gradient: 'from-red-500 to-red-700', text: 'text-red-100' },
    blue: { front: 'bg-blue-600', spine: 'bg-blue-800', gradient: 'from-blue-500 to-blue-700', text: 'text-blue-100' },
    yellow: { front: 'bg-yellow-500', spine: 'bg-yellow-700', gradient: 'from-yellow-400 to-orange-500', text: 'text-yellow-950' },
  };
  const c = colors[color];

  return (
    <div className={`relative w-[180px] h-[260px] md:w-[220px] md:h-[300px] transform-style-3d transition-transform duration-500 hover:scale-105 hover:z-50 ${rotateClass}`} style={{ zIndex }}>
        {/* Front Cover */}
        <div className={`absolute inset-0 ${c.front} rounded-r-md rounded-l-sm border-l-2 border-white/20 shadow-2xl overflow-hidden flex flex-col`}>
             <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-90`}></div>
             {/* Texture */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
             
             {/* Content */}
             <div className="relative z-10 p-4 flex flex-col h-full items-center text-center border-2 border-white/10 m-2 rounded">
                 <div className="mt-4 mb-2 p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                    <Icon size={32} className="text-white" />
                 </div>
                 <h3 className={`font-black text-2xl md:text-3xl leading-none mb-1 text-white drop-shadow-md`}>{title}</h3>
                 <p className={`text-xs md:text-sm font-bold uppercase tracking-wider ${c.text}`}>{subtitle}</p>
                 
                 <div className="mt-auto mb-4">
                    <div className="flex justify-center gap-1 mb-1">
                        {[1,2,3].map(i => <Star key={i} size={8} fill="currentColor" className="text-white" />)}
                    </div>
                    <div className="h-1 w-12 bg-white/40 rounded-full mx-auto"></div>
                 </div>
             </div>
             
             {/* Sheen */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Spine */}
        <div className={`absolute top-0 left-0 w-[20px] h-full ${c.spine} transform rotate-y-90 origin-left border-r border-black/10 flex items-center justify-center`}>
             <span className="text-white font-bold text-xs tracking-widest rotate-90 whitespace-nowrap opacity-80">{title}</span>
        </div>

        {/* Pages (Right Side) */}
        <div className="absolute top-1 right-0 w-[18px] h-[98%] bg-white transform rotate-y-90 translate-x-[9px] translate-z-[-1px] shadow-inner"></div>
        
        {/* Pages (Top) */}
        <div className="absolute top-0 left-0 w-[100%] h-[20px] bg-white transform rotate-x-90 origin-top"></div>
        
        {/* Pages (Bottom) */}
        <div className="absolute bottom-0 left-0 w-[100%] h-[20px] bg-white transform rotate-x-90 origin-bottom"></div>
    </div>
  );
};

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

      {/* CORE FEATURES GRID */}
      <section className="grid md:grid-cols-3 gap-6 relative z-10">
        {/* LUDO CARD */}
        <div className="block group relative cursor-not-allowed opacity-90 transition-all duration-500">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 h-full relative overflow-hidden group-hover:border-yellow-500/50">
            <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">COMING SOON</div>
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

      {/* BOOKS COLLECTION BANNER (PREMIUM REDESIGN WITH CHARACTERS) */}
      <section className="relative my-20">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] shadow-2xl -z-20 overflow-hidden">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
             {/* Pattern Grid */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 p-8 md:p-12 items-center">
            
            {/* Left: Content */}
            <div className="space-y-8">
                <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white text-xs font-bold shadow-lg mb-4">
                      <Star size={12} fill="currentColor" />
                      <span>Best-Selling Kids Series</span>
                   </div>
                   <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                      Anime Wonderlands <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Ultimate Collection</span>
                   </h2>
                </div>
                
                <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                   Turn screen time into learning time. Our premium activity books cover <strong>Maths, English, GK, and Art</strong> using engaging anime characters that kids actually love.
                </p>

                <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2"><Calculator size={14} className="text-red-400"/> Maths</span>
                    <span className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2"><Languages size={14} className="text-blue-400"/> English</span>
                    <span className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2"><Palette size={14} className="text-pink-400"/> Drawing</span>
                </div>

                <div className="pt-4">
                    <a 
                      href={BOOKS_LINK} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-orange-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] group"
                    >
                        <ShoppingBag className="text-orange-600 group-hover:scale-110 transition-transform" />
                        <span>Order Collection</span>
                        <ArrowRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>

            {/* Right: Premium 3D Books Showcase */}
            <div className="relative h-[400px] flex items-center justify-center perspective-[1000px] group/scene">
                
                {/* ANIME GIRL (LEFT) */}
                <div className="absolute left-0 bottom-8 z-30 transform md:-translate-x-4 transition-transform duration-500 group-hover/scene:-translate-x-8">
                    <div className="relative w-28 h-28 md:w-36 md:h-36">
                        {/* Placeholder using DiceBear Notionists Style which is clean & illustrative */}
                        <img 
                            src="https://api.dicebear.com/9.x/notionists/svg?seed=Mila&backgroundColor=e9d5ff" 
                            alt="Anime Girl"
                            className="w-full h-full object-contain drop-shadow-2xl hover:scale-110 transition-transform"
                        />
                        <div className="absolute -top-6 -right-6 bg-white text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-xl rounded-bl-none shadow-lg animate-bounce">
                            Love Reading! 📚
                        </div>
                    </div>
                </div>

                {/* ANIME BOY (RIGHT) */}
                <div className="absolute right-0 bottom-8 z-30 transform md:translate-x-4 transition-transform duration-500 group-hover/scene:translate-x-8">
                    <div className="relative w-28 h-28 md:w-36 md:h-36">
                        <img 
                            src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=fed7aa" 
                            alt="Anime Boy"
                            className="w-full h-full object-contain drop-shadow-2xl hover:scale-110 transition-transform"
                        />
                        <div className="absolute -top-6 -left-6 bg-white text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-xl rounded-br-none shadow-lg animate-bounce delay-700">
                            Maths Genius! 🧮
                        </div>
                    </div>
                </div>

                {/* Book 2: Maths (Left Back) */}
                <div className="absolute transform translate-x-[-60px] translate-z-[-50px] rotate-y-[-15deg] hover:z-20 transition-all duration-500">
                    <Book3D 
                      title="MATHS" 
                      subtitle="Logic & Numbers" 
                      color="red" 
                      icon={Calculator}
                      rotateClass="rotate-y-[-10deg]"
                      zIndex={10}
                    />
                </div>

                {/* Book 3: English (Right Back) */}
                <div className="absolute transform translate-x-[60px] translate-z-[-50px] rotate-y-[15deg] hover:z-20 transition-all duration-500">
                    <Book3D 
                      title="ENGLISH" 
                      subtitle="Words & Stories" 
                      color="blue" 
                      icon={Languages}
                      rotateClass="rotate-y-[10deg]"
                      zIndex={10}
                    />
                </div>

                {/* Book 1: Master Collection (Center Front) */}
                <div className="absolute transform translate-z-[50px] hover:scale-105 transition-transform duration-500 z-20">
                    <Book3D 
                      title="MASTER" 
                      subtitle="The Complete Kit" 
                      color="yellow" 
                      icon={BookOpen}
                      rotateClass="rotate-y-[0deg]"
                      zIndex={30}
                    />
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
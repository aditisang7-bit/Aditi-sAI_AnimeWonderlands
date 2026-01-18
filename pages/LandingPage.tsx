import React from 'react';
import { Link } from 'react-router-dom';
import { AppRoute } from '../types';
import { ArrowRight, Sparkles, Gamepad2, User, Play, Star } from 'lucide-react';
import { AdUnit } from '../components/AdUnit';

export const LandingPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-12">
      {/* Hero */}
      <section className="text-center pt-10 lg:pt-20 space-y-8 relative">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-full text-pink-300 text-sm font-bold animate-pulse">
          <Star size={14} fill="currentColor" />
          <span>#1 Anime Social Gaming Ecosystem</span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          Play. Create. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Become Legendary.
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Anime Wonderlands+ combines addictive gaming, AI transformation, and a vibrant community. Your future self is waiting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <Link 
            to={AppRoute.GAME_LUDO} 
            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-900/40 transition-all hover:scale-105 flex items-center space-x-3"
          >
            <Gamepad2 size={20} />
            <span>Play Anime Ludo</span>
          </Link>
          <Link 
            to={AppRoute.FUTURE_SELF} 
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors flex items-center space-x-3"
          >
            <Sparkles size={20} />
            <span>Try AI Future Self</span>
          </Link>
        </div>
      </section>

      {/* Ad Placement: In-Article (Break between Hero and Grid) */}
      <AdUnit type="in-article" />

      {/* Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-pink-500/50 transition-colors group">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors text-slate-400">
            <Gamepad2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Anime Ludo</h3>
          <p className="text-slate-400">Battle friends or AI bots in a cyberpunk arena. Earn WonderCoins and unlock legendary skins.</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-colors group">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors text-slate-400">
            <User size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Future Self AI</h3>
          <p className="text-slate-400">Visualize your success. Our AI transforms your photos into your ideal anime protagonist self.</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-colors group">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors text-slate-400">
            <Play size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Wonder Feed</h3>
          <p className="text-slate-400">Share your gameplay highlights and AI art. Connect with a billion-user anime community.</p>
        </div>
      </section>

      {/* Ad Placement: Multiplex (Recommendations at bottom) */}
      <section>
        <AdUnit type="multiplex" />
      </section>
    </div>
  );
};
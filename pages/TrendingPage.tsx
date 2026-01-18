import React from 'react';
import { Heart, Share2 } from 'lucide-react';

const TrendCard = ({ img, title, author }: { img: string, title: string, author: string }) => (
  <div className="break-inside-avoid mb-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all group">
    <div className="relative">
      <img src={img} alt={title} className="w-full h-auto" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          Try this style
        </button>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <span className="text-xs text-slate-400">@{author}</span>
        </div>
        <div className="flex space-x-3 text-slate-500">
          <button className="hover:text-pink-500 transition-colors"><Heart size={16} /></button>
          <button className="hover:text-blue-500 transition-colors"><Share2 size={16} /></button>
        </div>
      </div>
    </div>
  </div>
);

export const TrendingPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Trending Creations</h1>
        <p className="text-slate-400">See what the community is creating with Aditi’s AI</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
        <TrendCard 
          img="https://picsum.photos/id/10/400/500" 
          title="Cyberpunk Avatar" 
          author="neo_artist" 
        />
        <TrendCard 
          img="https://picsum.photos/id/20/400/300" 
          title="Minimalist Product Shot" 
          author="design_daily" 
        />
        <TrendCard 
          img="https://picsum.photos/id/30/400/600" 
          title="Fantasy Landscape" 
          author="dream_weaver" 
        />
        <TrendCard 
          img="https://picsum.photos/id/40/400/400" 
          title="YouTube Tech Review Thumb" 
          author="mkbhd_fan" 
        />
        <TrendCard 
          img="https://picsum.photos/id/50/400/550" 
          title="Retro Anime Style" 
          author="otaku_life" 
        />
        <TrendCard 
          img="https://picsum.photos/id/60/400/350" 
          title="Professional Headshot" 
          author="linkedin_pro" 
        />
      </div>
    </div>
  );
};
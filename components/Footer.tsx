import React from 'react';
import { Link } from 'react-router-dom';
import { AppRoute } from '../types';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900/50 pt-12 pb-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-lg text-white">Aditi's AI</span>
          </div>
          <p className="text-sm text-slate-400">
            Empowering creators with next-gen AI tools for image, video, and social growth.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-bold text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to={AppRoute.IMAGE_DASHBOARD} className="hover:text-purple-400">Image Studio</Link></li>
            <li><Link to={AppRoute.VIDEO_TOOLS} className="hover:text-purple-400">Video Creator</Link></li>
            <li><Link to={AppRoute.GAME_LUDO} className="hover:text-purple-400">Anime Ludo</Link></li>
            <li><Link to={AppRoute.PRICING} className="hover:text-purple-400">Pricing</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to={AppRoute.ABOUT} className="hover:text-purple-400">About Us</Link></li>
            <li><Link to={AppRoute.CONTACT} className="hover:text-purple-400">Contact</Link></li>
            <li><a href="#" className="hover:text-purple-400">Careers</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to={AppRoute.PRIVACY} className="hover:text-purple-400">Privacy Policy</Link></li>
            <li><Link to={AppRoute.TERMS} className="hover:text-purple-400">Terms of Service</Link></li>
            <li><Link to={AppRoute.PRIVACY} className="hover:text-purple-400">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© {year} Aditi's AI. All rights reserved.</p>
        <p>Protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</p>
      </div>
    </footer>
  );
};
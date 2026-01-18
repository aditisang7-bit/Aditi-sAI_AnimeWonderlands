import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  Sparkles, 
  MessageCircle, 
  Home, 
  Menu, 
  X,
  Crown,
  ShieldAlert,
  LogOut,
  Settings,
  Coins,
  Image,
  Video,
  FileText,
  Cookie,
  Ghost
} from 'lucide-react';
import { AppRoute } from '../types';
import { APP_NAME, ADMIN_EMAIL } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Footer } from './Footer';

const NavLink = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-900/40' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-pink-400'}`}>
        {icon}
      </span>
      <span className="font-bold tracking-wide">{label}</span>
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [wonderCoins, setWonderCoins] = useState(500); 
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === AppRoute.LOGIN || location.pathname === AppRoute.REGISTER;

  // --- EXIT INTENT FEEDBACK & COOKIE CHECK ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave Aditi's AI? Unsaved progress in chats or generators will be lost.";
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cookie Consent Check
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShowCookieConsent(true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowCookieConsent(false);
  };

  const fetchProfile = async () => {
    // 1. Check Guest Mode
    const isGuest = localStorage.getItem('guest_mode') === 'true';
    if (isGuest) {
        setProfile({
            full_name: 'Guest Explorer',
            email: 'guest@aditis.ai',
            is_pro: false,
            id: 'guest'
        });
        const guestCoins = parseInt(localStorage.getItem('guest_coins') || '500');
        setWonderCoins(guestCoins);
        return;
    }

    // 2. Check Supabase
    if (!isSupabaseConfigured) {
        // Fallback for offline mode without explicit guest flag
        setProfile(null);
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      ensureProfile(session.user);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchProfile();

    if (isSupabaseConfigured) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) ensureProfile(session.user);
          else if (!localStorage.getItem('guest_mode')) setProfile(null);
        });
        
        const handleCoinUpdate = () => fetchProfile();
        window.addEventListener('coin_update', handleCoinUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('coin_update', handleCoinUpdate);
        };
    } else {
        const handleCoinUpdate = () => fetchProfile();
        window.addEventListener('coin_update', handleCoinUpdate);
        return () => window.removeEventListener('coin_update', handleCoinUpdate);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [location.pathname]);

  const ensureProfile = async (user: any) => {
    try {
      let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!data) {
        const { error: insertError } = await supabase.from('profiles').insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'WonderTraveller',
          is_pro: false,
          coins: 500 // Start with 500
        }]);
        if (!insertError) {
          const retry = await supabase.from('profiles').select('*').eq('id', user.id).single();
          data = retry.data;
        }
      }
      if (data) {
        setProfile(data);
        // Use database coins, fallback to local var logic for legacy support if column missing
        setWonderCoins(data.coins !== undefined ? data.coins : (data.is_pro ? 5000 : 500)); 
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const handleLogout = async () => {
    if (localStorage.getItem('guest_mode') === 'true') {
        localStorage.removeItem('guest_mode');
    }
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setProfile(null);
    navigate(AppRoute.LOGIN);
  };

  if (isAuthPage) return <div className="min-h-screen bg-[#0f0e17] text-white">{children}</div>;

  const isAdmin = profile?.email === ADMIN_EMAIL;
  const isGuest = profile?.id === 'guest';

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#16161e] border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to={AppRoute.HOME} className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200 leading-none">
              Aditi's<br/>AI
            </span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* WonderCoins Wallet */}
        {profile && (
          <div className="px-6 mb-4">
            <div className={`bg-gradient-to-r ${profile.is_pro ? 'from-purple-900 to-purple-800 border-purple-500/50' : 'from-slate-900 to-slate-800 border-slate-700/50'} rounded-2xl p-4 border flex items-center justify-between shadow-inner relative overflow-hidden transition-all duration-500`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
              <div className="flex flex-col z-10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">WonderCoins</span>
                <span className="text-xl font-black text-yellow-400 flex items-center gap-1">
                  {wonderCoins.toLocaleString()}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border z-10 ${profile.is_pro ? 'bg-purple-500/30 border-purple-400 text-yellow-300' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'}`}>
                {profile.is_pro ? <Crown size={20} fill="currentColor" /> : <Coins size={20} fill="currentColor" />}
              </div>
            </div>
          </div>
        )}

        <nav className="px-4 space-y-2">
          <NavLink to={AppRoute.HOME} icon={<Home size={20} />} label="Lobby" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Creation Studio</div>
          <NavLink to={AppRoute.IMAGE_DASHBOARD} icon={<Image size={20} />} label="Image Studio" onClick={() => setIsMobileMenuOpen(false)} />
          <NavLink to={AppRoute.VIDEO_TOOLS} icon={<Video size={20} />} label="Video Studio" onClick={() => setIsMobileMenuOpen(false)} />
          <NavLink to={AppRoute.DOC_TOOLS} icon={<FileText size={20} />} label="Document AI" onClick={() => setIsMobileMenuOpen(false)} />

          <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Game Center</div>
          <NavLink to={AppRoute.GAME_LUDO} icon={<Gamepad2 size={20} />} label="Anime Ludo" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Social</div>
          <NavLink to={AppRoute.FUTURE_SELF} icon={<Sparkles size={20} />} label="Future Self" onClick={() => setIsMobileMenuOpen(false)} />
          <NavLink to={AppRoute.SOCIAL_FEED} icon={<MessageCircle size={20} />} label="Wonder Feed" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Premium</div>
          <NavLink to={AppRoute.PRICING} icon={<Crown size={20} />} label="Wonderlands+" onClick={() => setIsMobileMenuOpen(false)} />
          <NavLink to={AppRoute.SETTINGS} icon={<Settings size={20} />} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-[#16161e]">
           {isAdmin && (
             <div className="mb-4 px-2">
               <Link to={AppRoute.ADMIN} className="flex items-center space-x-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors p-2 bg-red-950/30 rounded-lg border border-red-900/50">
                 <ShieldAlert size={14} />
                 <span>Admin Control</span>
               </Link>
             </div>
           )}
           {profile ? (
             <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${profile.is_pro ? 'border-yellow-400 bg-yellow-500/20 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'border-purple-500 bg-purple-500/20 text-purple-400'}`}>
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate flex items-center gap-1">
                      {profile.full_name} 
                      {profile.is_pro && <Crown size={12} className="text-yellow-400" fill="currentColor" />}
                      {isGuest && <Ghost size={12} className="text-slate-400" />}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{profile.is_pro ? 'Pro Creator' : (isGuest ? 'Guest User' : 'Beginner')}</p>
                  </div>
                  <button onClick={handleLogout} className="text-slate-500 hover:text-red-400" title="Logout">
                    <LogOut size={16} />
                  </button>
                </div>
             </div>
           ) : (
             <Link to={AppRoute.LOGIN} className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-center rounded-xl text-sm font-bold transition-colors">
               Login to Save Progress
             </Link>
           )}
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-[#0f0e17]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 lg:hidden">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-bold">{APP_NAME}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative z-10 flex flex-col">
          {isGuest && (
              <div className="mb-4 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-400 text-xs flex justify-between items-center">
                  <span>Viewing as Guest. Progress is saved to this browser only.</span>
                  <Link to={AppRoute.REGISTER} className="text-purple-400 hover:text-white font-bold">Create Account</Link>
              </div>
          )}
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>

        {/* Cookie Consent Banner */}
        {showCookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-50 p-4 bg-slate-900 border-t border-slate-800 shadow-2xl animate-fade-in">
             <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex items-start gap-4">
                 <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400">
                   <Cookie size={24} />
                 </div>
                 <p className="text-sm text-slate-300">
                   We use cookies to improve your experience and serve personalized ads (Google AdSense). By continuing, you agree to our <Link to={AppRoute.PRIVACY} className="text-purple-400 hover:underline">Privacy Policy</Link>.
                 </p>
               </div>
               <div className="flex gap-2">
                 <button onClick={acceptCookies} className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 text-sm">Accept</button>
                 <button onClick={acceptCookies} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 text-sm">Decline</button>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
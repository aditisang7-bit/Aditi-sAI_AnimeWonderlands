import React, { useState, useEffect, useRef } from 'react';
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
  Ghost,
  Bot,
  Volume2,
  VolumeX,
  Palette,
  ShoppingBag,
  Sun,
  Moon
} from 'lucide-react';
import { AppRoute } from '../types';
import { APP_NAME, ADMIN_EMAIL, BOOKS_LINK } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Footer } from './Footer';
import { AdUnit } from './AdUnit';
import { playUiSound, toggleMute, getMuteState } from '../services/audioTheme';
import { setTheme, initTheme, toggleMode, getCurrentMode, ThemeColor, THEMES } from '../services/themeService';

const NavLink = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={() => {
        playUiSound('click');
        if (onClick) onClick();
      }}
      onMouseEnter={() => playUiSound('hover')}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-900/40' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <span className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400'}`}>
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
  const [isMuted, setIsMuted] = useState(getMuteState());
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const themePickerRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === AppRoute.LOGIN || location.pathname === AppRoute.REGISTER;

  // --- EXIT INTENT FEEDBACK & COOKIE CHECK & GLOBAL AUDIO ---
  useEffect(() => {
    // Initialize Theme
    initTheme();
    setIsDarkMode(getCurrentMode() === 'dark');

    // 1. Play sound on route change
    playUiSound('click');

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave Aditi's AI? Unsaved progress in chats or generators will be lost.";
      return e.returnValue;
    };

    // 2. Global Click Listener for UI sounds
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Close theme picker if clicked outside
      if (themePickerRef.current && !themePickerRef.current.contains(target)) {
        setShowThemePicker(false);
      }

      // Check if clicking a button or link (or inside one)
      if (target.closest('button') || target.closest('a')) {
        playUiSound('click');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('click', handleGlobalClick);
    
    // Cookie Consent Check
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShowCookieConsent(true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [location.pathname]);

  const handleToggleMute = () => {
    const newState = toggleMute();
    setIsMuted(newState);
    if (!newState) playUiSound('activate');
  };

  const handleThemeChange = (color: ThemeColor) => {
    setTheme(color);
    playUiSound('success');
    setShowThemePicker(false);
  };

  const handleModeToggle = () => {
    const isDark = toggleMode();
    setIsDarkMode(isDark);
    playUiSound('activate');
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowCookieConsent(false);
    playUiSound('success');
  };

  const fetchProfile = async () => {
    // Check Supabase
    if (!isSupabaseConfigured) {
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
          else setProfile(null);
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
        const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'WonderTraveller';
        const { error: insertError } = await supabase.from('profiles').insert([{
          id: user.id,
          email: user.email,
          full_name: defaultName,
          is_pro: false,
          coins: 500 // Start with 500
        }]);
        if (!insertError) {
          const retry = await supabase.from('profiles').select('*').eq('id', user.id).single();
          data = retry.data;
        } else {
           // If insert fails (e.g. RLS), try to construct a temporary profile object for UI
           console.warn("Could not create profile in DB, using temporary profile");
           data = {
             id: user.id,
             email: user.email,
             full_name: defaultName,
             is_pro: false,
             coins: 500
           };
        }
      }
      
      if (data) {
        // --- OPTIMISTIC COIN UPDATE ---
        const isProLocal = localStorage.getItem('aw_pro_status') === 'true';
        let displayCoins = data.coins !== undefined ? data.coins : 500;

        if (isProLocal && !data.is_pro) {
            data.is_pro = true;
            const planType = localStorage.getItem('aw_plan_type') || 'monthly';
            data.plan_type = planType;
            const bonus = planType === 'yearly' ? 60000 : 5000;
            displayCoins += bonus;
        }

        setProfile(data);
        setWonderCoins(displayCoins); 
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    // Clear optimistic flags on logout
    localStorage.removeItem('aw_pro_status');
    localStorage.removeItem('aw_plan_type');
    setProfile(null);
    navigate(AppRoute.LOGIN);
  };

  if (isAuthPage) return <div className="min-h-screen bg-slate-50 dark:bg-[#0f0e17] text-slate-900 dark:text-white transition-colors duration-300">{children}</div>;

  const isAdmin = profile?.email === ADMIN_EMAIL;
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0e17] text-slate-900 dark:text-white flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#16161e] border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-xl lg:shadow-none`}>
        {/* Header - Fixed Top */}
        <div className="p-6 flex items-center justify-between shrink-0">
          <Link to={AppRoute.HOME} className="flex items-center space-x-2" onMouseEnter={() => playUiSound('activate')}>
            <div className="w-9 h-9 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-pink-200 leading-none">
              Aditi's<br/>AI
            </span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Middle Section */}
        <div className="flex-1 overflow-y-auto">
          {/* WonderCoins Wallet */}
          {profile && (
            <div className="px-6 mb-4">
              <div className={`bg-gradient-to-r ${profile.is_pro ? 'from-purple-900 to-purple-800 border-purple-500/50' : 'from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700/50'} rounded-2xl p-4 border flex items-center justify-between shadow-inner relative overflow-hidden transition-all duration-500`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                <div className="flex flex-col z-10">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${profile.is_pro ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'}`}>WonderCoins</span>
                  <span className={`text-xl font-black flex items-center gap-1 ${profile.is_pro ? 'text-yellow-300' : 'text-slate-900 dark:text-yellow-400'}`}>
                    {wonderCoins.toLocaleString()}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border z-10 ${profile.is_pro ? 'bg-purple-500/30 border-purple-400 text-yellow-300' : 'bg-yellow-100 dark:bg-yellow-500/20 border-yellow-300 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400'}`}>
                  {profile.is_pro ? <Crown size={20} fill="currentColor" /> : <Coins size={20} fill="currentColor" />}
                </div>
              </div>
            </div>
          )}

          <nav className="px-4 space-y-1 pb-6">
            <NavLink to={AppRoute.HOME} icon={<Home size={20} />} label="Lobby" onClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to={AppRoute.AI_ASSISTANT} icon={<Bot size={20} />} label="Wonder Chat" onClick={() => setIsMobileMenuOpen(false)} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Creation Studio</div>
            <NavLink to={AppRoute.IMAGE_DASHBOARD} icon={<Image size={20} />} label="Image Studio" onClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to={AppRoute.VIDEO_TOOLS} icon={<Video size={20} />} label="Video Studio" onClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to={AppRoute.DOC_TOOLS} icon={<FileText size={20} />} label="Document AI" onClick={() => setIsMobileMenuOpen(false)} />

            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Store</div>
            <a 
              href={BOOKS_LINK} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            >
               <span className="text-slate-500 dark:text-slate-400 group-hover:text-orange-500">
                  <ShoppingBag size={20} />
               </span>
               <span className="font-bold tracking-wide">Books & Comics</span>
            </a>

            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Game Center</div>
            <div className="relative group cursor-not-allowed px-4 py-3 flex items-center space-x-3 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
              <Gamepad2 size={20} />
              <span className="font-bold tracking-wide">Anime Ludo</span>
              <span className="absolute right-4 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/30">SOON</span>
            </div>
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Social</div>
            <NavLink to={AppRoute.FUTURE_SELF} icon={<Sparkles size={20} />} label="Future Self" onClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to={AppRoute.SOCIAL_FEED} icon={<MessageCircle size={20} />} label="Wonder Feed" onClick={() => setIsMobileMenuOpen(false)} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Premium</div>
            <NavLink to={AppRoute.PRICING} icon={<Crown size={20} />} label="Wonderlands+" onClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to={AppRoute.SETTINGS} icon={<Settings size={20} />} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
          </nav>
        </div>

        {/* Footer - Fixed Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16161e] shrink-0 relative" ref={themePickerRef}>
           {/* Controls Container */}
           <div className="mb-4 px-2 flex justify-between items-center">
              <div className="flex gap-2">
                  {/* Theme Picker Trigger */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowThemePicker(!showThemePicker); }}
                      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Change Theme Color"
                    >
                      <Palette size={18} />
                    </button>
                    {/* Theme Popup */}
                    {showThemePicker && (
                      <div className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl flex gap-2 animate-fade-in z-50 w-max">
                        {(Object.keys(THEMES) as ThemeColor[]).map(color => (
                            <button
                              key={color}
                              onClick={(e) => { e.stopPropagation(); handleThemeChange(color); }}
                              className="w-6 h-6 rounded-full border border-slate-300 dark:border-white/20 hover:scale-110 transition-transform"
                              style={{ backgroundColor: THEMES[color][500] }}
                              title={color.charAt(0).toUpperCase() + color.slice(1)}
                            />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dark Mode Toggle */}
                  <button 
                    onClick={handleModeToggle}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
              </div>

              {/* Sound Toggle */}
              <button 
                onClick={handleToggleMute} 
                className={`p-2 rounded-full transition-colors ${isMuted ? 'text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-400' : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'}`}
                title={isMuted ? "Unmute UI Sounds" : "Mute UI Sounds"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
           </div>

           {isAdmin && (
             <div className="mb-4 px-2">
               <Link to={AppRoute.ADMIN} className="flex items-center space-x-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50">
                 <ShieldAlert size={14} />
                 <span>Admin Control</span>
               </Link>
             </div>
           )}
           {profile ? (
             <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${profile.is_pro ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'border-purple-500 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'}`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                      {displayName} 
                      {profile.is_pro && <Crown size={12} className="text-yellow-500 dark:text-yellow-400" fill="currentColor" />}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{profile.is_pro ? 'Pro Creator' : 'Beginner'}</p>
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400" title="Logout">
                    <LogOut size={16} />
                  </button>
                </div>
             </div>
           ) : (
             <Link to={AppRoute.LOGIN} className="block w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-center rounded-xl text-sm font-bold transition-colors">
               Login to Save Progress
             </Link>
           )}
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f0e17]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 lg:hidden">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{APP_NAME}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative z-10 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          
          {/* Bottom Ad Unit Placement */}
          <div className="mt-8">
            <AdUnit type="display" />
          </div>

          <Footer />
        </main>

        {/* Cookie Consent Banner */}
        {showCookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-50 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
             <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex items-start gap-4">
                 <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                   <Cookie size={24} />
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-300">
                   We use cookies to improve your experience and serve personalized ads (Google AdSense). By continuing, you agree to our <Link to={AppRoute.PRIVACY} className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>.
                 </p>
               </div>
               <div className="flex gap-2">
                 <button onClick={acceptCookies} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 text-sm">Accept</button>
                 <button onClick={acceptCookies} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-sm">Decline</button>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
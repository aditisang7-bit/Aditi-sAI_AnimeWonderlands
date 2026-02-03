import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';
import { Zap, Mail, Lock, ArrowRight, Loader2, User, AlertCircle } from 'lucide-react';
import { APP_NAME } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === AppRoute.REGISTER;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Check for redirect errors from Supabase
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(hash.indexOf('#') + 1)); 
      
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');
      
      if (errorDescription) {
        setError(decodeURIComponent(errorDescription).replace(/\+/g, ' '));
      } else if (errorCode) {
        setError(`Authentication Error: ${errorCode}`);
      }
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // GUARD: Check if Supabase is available
    if (!isSupabaseConfigured) {
      setError("Service Unavailable: Supabase credentials are missing from the environment. Auth is disabled.");
      setLoading(false);
      return;
    }

    const email = formData.email.trim();
    const password = formData.password;

    try {
      if (isRegister) {
        // 1. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: formData.name
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create profile with STARTER COINS using upsert to be safe
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              { 
                id: authData.user.id, 
                email: email,
                full_name: formData.name,
                is_pro: false,
                coins: 500 // Initial Bonus
              }
            ], { onConflict: 'id' });

          if (profileError) {
             console.warn('Profile creation note:', profileError.message);
          }
          
          // 3. Auto-Login Check (if email confirm is off)
          if (!authData.session) {
             const { error: signInError } = await supabase.auth.signInWithPassword({
               email: email,
               password: password,
             });
             
             if (signInError) {
                const errMsg = (signInError.message || '').toLowerCase();

                if (errMsg.includes("email not confirmed")) {
                    console.warn("Email confirmation blocking login. Proceeding to dashboard.");
                    navigate(AppRoute.IMAGE_DASHBOARD);
                    return;
                }
                
                // If user exists but password mismatch during registration attempt
                if (errMsg.includes("invalid login credentials")) {
                    setError("This email is already registered. Please Sign In.");
                    setLoading(false);
                    return;
                }

                throw signInError;
             }
          }

          navigate(AppRoute.IMAGE_DASHBOARD);
        }
      } else {
        // Login Logic
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
            throw signInError;
        }

        // On successful login, ensure profile exists (heal broken accounts)
        if (authData.user) {
            const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', authData.user.id).single();
            
            if (!existingProfile) {
                console.log("Healing missing profile for user...");
                await supabase.from('profiles').insert([{
                    id: authData.user.id,
                    email: authData.user.email,
                    full_name: authData.user.user_metadata?.full_name || 'User',
                    is_pro: false,
                    coins: 500
                }]);
            }
        }

        navigate(AppRoute.IMAGE_DASHBOARD);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      
      const msg = (err.message || '').toLowerCase();
      
      // Friendly error messages mapping
      if (msg.includes("invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
        // Optional: clear password to force retry
        setFormData(prev => ({ ...prev, password: '' }));
      } else if (msg.includes("user already registered")) {
        setError("This email is already registered. Please sign in.");
      } else if (msg.includes("email not confirmed")) {
        setError("Please check your email to confirm your account.");
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f0e17] dark:bg-[#0f0e17]">
      {/* Abstract Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={AppRoute.HOME} className="inline-flex items-center space-x-2 mb-6 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">{APP_NAME}</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isRegister ? 'Start creating with AI power today' : 'Enter your details to access your workspace'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm animate-fade-in text-left">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-3 placeholder-slate-600 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value.trim()});
                  if (error) setError(null); // Clear error on edit
                }}
                className="w-full bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-3 placeholder-slate-600 outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1">
             <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                {!isRegister && <a href="#" className="text-xs text-purple-400 hover:text-purple-300">Forgot password?</a>}
             </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  if (error) setError(null); // Clear error on edit
                }}
                className="w-full bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-3 placeholder-slate-600 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}
            <Link 
              to={isRegister ? AppRoute.LOGIN : AppRoute.REGISTER} 
              className="font-medium text-purple-400 hover:text-purple-300 ml-1 transition-colors"
            >
              {isRegister ? 'Sign in' : 'Sign up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
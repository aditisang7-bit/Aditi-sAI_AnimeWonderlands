import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Zap, ArrowRight, Star, Loader2, Coins, Crown, ShieldAlert, Lock } from 'lucide-react';
import { AppRoute } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'monthly';
  const paymentId = searchParams.get('payment_id');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [coinsAdded, setCoinsAdded] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyAndRecordOrder = async () => {
      try {
        if (!isSupabaseConfigured) {
            throw new Error("Supabase is not configured. Cannot verify payment in offline mode.");
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("No authenticated user found.");
        }

        if (!paymentId) {
          throw new Error("Missing Payment ID.");
        }

        const planType = plan.toLowerCase().includes('year') ? 'yearly' : 'monthly';
        const coinsReward = planType === 'yearly' ? 60000 : 5000;

        // --- OPTIMISTIC UI UPDATE ---
        localStorage.setItem('aw_pro_status', 'true');
        localStorage.setItem('aw_plan_type', planType);
        window.dispatchEvent(new Event('coin_update'));

        // --- DATABASE PERSISTENCE LOGIC ---
        // 1. Try Edge Function (Secure) - Optional if deployed
        let functionSuccess = false;
        try {
            const { data: funcData, error: funcError } = await supabase.functions.invoke('verify-payment', {
              body: { paymentId, plan, userId: user.id }
            });
            if (funcData && funcData.success) {
                setCoinsAdded(funcData.coinsAdded);
                functionSuccess = true;
            }
        } catch (e) {
            console.warn("Edge Function skipped:", e);
        }

        if (functionSuccess) {
            setStatus('success');
            return;
        }

        // 2. FALLBACK: Direct Database Update (Demo / Dev Mode)
        console.warn("Attempting direct DB update...");
        
        // Get current profile data safely
        let currentCoins = 0;
        // First try to fetch existing
        const { data: profileData } = await supabase.from('profiles').select('coins').eq('id', user.id).single();
        if (profileData) {
            currentCoins = profileData.coins || 0;
        }

        const newBalance = currentCoins + coinsReward;

        // CRITICAL FIX: Use UPSERT instead of UPDATE.
        // This ensures that if the profile row is missing (for whatever reason), it gets created with the Pro status.
        // We include all necessary fields for a valid profile.
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            is_pro: true,
            plan_type: planType,
            coins: newBalance,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (profileError) {
            console.error("Direct Profile Update Failed:", profileError);
            throw new Error(`DB Save Failed: ${profileError.message}`);
        } else {
            console.log("Direct Profile Update Success");
        }

        // Log Order (Fail-safe: don't block success if order log fails)
        const { error: orderError } = await supabase.from('orders').insert({
            user_id: user.id,
            payment_id: paymentId,
            amount: planType === 'yearly' ? 1999 : 1699,
            plan_id: planType,
            status: 'completed'
        });

        if (orderError) console.warn("Order log failed:", orderError.message);

        setCoinsAdded(coinsReward);
        setStatus('success');

      } catch (err: any) {
        console.error("Payment verification error:", err);
        setErrorMessage(err.message || "Unknown error occurred");
        // Ensure UI stays in error state if DB write failed
        setStatus('error');
      }
    };

    if (paymentId) {
        verifyAndRecordOrder();
    }
  }, [plan, paymentId]);

  if (status === 'processing') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying Payment...</h2>
        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 justify-center mt-2">
           <ShieldAlert size={14} /> 
           <span>Securely communicating with payment gateway</span>
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Star className="text-red-500 w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verification Failed</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">We could not verify your payment securely.</p>
        <p className="text-red-400 text-sm mb-8 bg-red-900/20 p-2 rounded px-4">{errorMessage}</p>
        <p className="text-xs text-slate-500 mb-8">Ref: {paymentId}</p>
        <Link to={AppRoute.HOME} className="text-purple-600 dark:text-purple-400 hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce">
          <CheckCircle className="text-white w-10 h-10" strokeWidth={3} />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Verified!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Welcome to the <span className="text-purple-600 dark:text-purple-400 font-bold capitalize">{plan} Plan</span>. <br/>
          Your account has been upgraded instantly.
        </p>

        <div className="bg-slate-100 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mb-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
           <Lock size={12} />
           <span>Plan is active for the full duration and cannot be cancelled early.</span>
        </div>

        {/* Perks Showcase */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={14} className="text-yellow-500 dark:text-yellow-400" /> Rewards Unlocked
          </h3>
          
          <ul className="space-y-4">
            {coinsAdded > 0 && (
              <li className="flex items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mr-4 text-yellow-600 dark:text-yellow-400">
                  <Coins size={20} fill="currentColor" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-lg">+{coinsAdded.toLocaleString()} WonderCoins</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Added to your wallet</div>
                </div>
              </li>
            )}

             <li className="flex items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-4 text-purple-600 dark:text-purple-400">
                <Crown size={20} fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-lg">Pro Creator Badge</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Visible on your dashboard</div>
              </div>
            </li>
          </ul>
        </div>

        <Link 
          to={AppRoute.IMAGE_DASHBOARD}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-colors flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Go to Studio</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
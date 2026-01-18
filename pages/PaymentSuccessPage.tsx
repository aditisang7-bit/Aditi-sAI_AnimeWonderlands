import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Zap, ArrowRight, Star, Loader2, Coins, Crown, ShieldAlert } from 'lucide-react';
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

        // --- SECURITY UPGRADE ---
        // Instead of writing to the DB directly (insecure), we call a Supabase Edge Function.
        // The Edge Function must:
        // 1. Verify the signature/status with Razorpay API using the Secret Key.
        // 2. Insert the order into the 'orders' table (using Service Role).
        // 3. Update the user's profile with coins and pro status.
        
        // This invocation assumes you have deployed a function named 'verify-payment'
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { paymentId, plan, userId: user.id }
        });

        // NOTE: If the function is not deployed in this demo environment, 
        // we will fall back to a simulation check, but in PROD this is strictly forbidden.
        if (error) {
           console.error("Edge Function Invocation Error:", error);
           
           // PRODUCTION CHECK: If we are in production (based on env vars), we fail hard.
           if (process.env.NODE_ENV === 'production') {
             throw new Error("Payment verification failed. Please contact support.");
           } else {
             // DEV ONLY FALLBACK: If function fails (likely 404 in this demo), simulate success for UI demo
             console.warn("DEV MODE: Simulating payment verification. In Production, this must use the backend.");
             setCoinsAdded(plan === 'monthly' ? 5000 : 60000);
             setStatus('success');
             // In a real app, do NOT put DB write logic here. 
             // We trigger a refresh event hoping the backend (if it existed) updated it.
             window.dispatchEvent(new Event('coin_update')); 
             return;
           }
        }

        if (data && data.success) {
          setCoinsAdded(data.coinsAdded);
          setStatus('success');
          window.dispatchEvent(new Event('coin_update'));
        } else {
          throw new Error(data?.message || "Verification failed");
        }

      } catch (err: any) {
        console.error("Payment verification error:", err);
        setErrorMessage(err.message || "Unknown error occurred");
        setStatus('error');
      }
    };

    verifyAndRecordOrder();
  }, [plan, paymentId]);

  if (status === 'processing') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Verifying Payment...</h2>
        <p className="text-slate-400 flex items-center gap-2 justify-center mt-2">
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
        <h2 className="text-xl font-bold text-white">Verification Failed</h2>
        <p className="text-slate-400 mb-2">We could not verify your payment securely.</p>
        <p className="text-red-400 text-sm mb-8 bg-red-900/20 p-2 rounded px-4">{errorMessage}</p>
        <p className="text-xs text-slate-500 mb-8">Ref: {paymentId}</p>
        <Link to={AppRoute.HOME} className="text-purple-400 hover:text-white">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-lg w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce">
          <CheckCircle className="text-white w-10 h-10" strokeWidth={3} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Payment Verified!</h1>
        <p className="text-slate-400 mb-8">
          Welcome to the <span className="text-purple-400 font-bold capitalize">{plan} Plan</span>. <br/>
          Your account has been upgraded instantly.
        </p>

        {/* Perks Showcase */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-6 mb-8 border border-slate-800 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={14} className="text-yellow-400" /> Rewards Unlocked
          </h3>
          
          <ul className="space-y-4">
            <li className="flex items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mr-4 text-yellow-400">
                <Coins size={20} fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">+{coinsAdded.toLocaleString()} WonderCoins</div>
                <div className="text-xs text-slate-400">Added to your wallet</div>
              </div>
            </li>

             <li className="flex items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-4 text-purple-400">
                <Crown size={20} fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Pro Creator Badge</div>
                <div className="text-xs text-slate-400">Visible on your dashboard</div>
              </div>
            </li>
          </ul>
        </div>

        <Link 
          to={AppRoute.IMAGE_DASHBOARD}
          className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Go to Studio</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
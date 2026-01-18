import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, X, Loader2, Lock, CreditCard, CheckCircle, LogIn } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { AppRoute } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  userEmail?: string;
  userName?: string;
}

// Declare Razorpay on window for TS
declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, planName, price, userEmail, userName }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const res = await loadRazorpay();

    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    // Determine amount (Razorpay takes amount in paisa)
    // ₹1,699 -> 169900
    // ₹1,999 -> 199900
    const numericAmount = planName.toLowerCase().includes('year') ? 1999 : 1699;
    const amountInPaisa = numericAmount * 100;

    // SECURITY NOTE: In a complete production environment, you should fetch the 
    // order_id from your backend (Edge Function) here instead of creating the payment client-side.
    // This prevents amount tampering.
    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      alert("Payment Configuration Error: Missing API Key");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: razorpayKey, // SECURED: Using environment variable
      amount: amountInPaisa,
      currency: "INR",
      name: "Anime Wonderlands+",
      description: `Upgrade to ${planName}`,
      image: "https://via.placeholder.com/150/9333ea/ffffff?text=AW%2B", // Brand Logo
      handler: function (response: any) {
        // Success Handler
        const planType = planName.toLowerCase().includes('year') ? 'yearly' : 'monthly';
        
        // Navigate to success page. 
        // SECURITY: The Success page must Verify this ID with the backend before granting coins.
        navigate(`${AppRoute.PAYMENT_SUCCESS}?plan=${planType}&payment_id=${response.razorpay_payment_id}`);
      },
      prefill: {
        name: userName || "Wonder User",
        email: userEmail || "user@example.com",
        contact: "" 
      },
      notes: {
        address: "Anime Wonderlands Cloud HQ",
        plan: planName
      },
      theme: {
        color: "#9333ea" // Purple-600
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <CreditCard className="text-purple-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Upgrade</h2>
          <p className="text-slate-400 text-sm">You selected the <span className="text-purple-400 font-bold">{planName}</span></p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
             <span className="text-slate-300 font-medium">Total Amount</span>
             <span className="text-3xl font-bold text-white">{price}</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Account Email</label>
              <div className="w-full bg-slate-950/50 border border-slate-800 text-slate-300 rounded-xl p-3 cursor-not-allowed flex items-center gap-2">
                <Lock size={14} />
                {userEmail || 'Guest'}
              </div>
            </div>
          </div>

          <button 
            onClick={handleRazorpayPayment}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center space-x-2 mt-4 transition-all hover:scale-[1.02]"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Connecting Razorpay...</span>
              </>
            ) : (
              <>
                <Zap size={16} fill="currentColor" />
                <span>Pay Now</span>
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 mt-4">
             <Lock size={12} />
             <span>Secured by Razorpay. Test Mode Active.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingCard = ({ 
  name, 
  price, 
  period,
  features, 
  popular = false,
  bestValue = false,
  cta = "Get Started",
  onSelect,
  isCurrentPlan = false
}: { 
  name: string, 
  price: string, 
  period: string,
  features: string[], 
  popular?: boolean,
  bestValue?: boolean,
  cta?: string,
  onSelect: () => void,
  isCurrentPlan?: boolean
}) => (
  <div className={`relative p-8 rounded-3xl border flex flex-col h-full transition-all duration-300 ${
    isCurrentPlan
      ? 'bg-slate-900 border-green-500 ring-1 ring-green-500/50 shadow-2xl shadow-green-900/20'
      : popular 
        ? 'bg-slate-900 border-purple-500 shadow-2xl shadow-purple-900/20 transform md:-translate-y-4' 
        : bestValue 
          ? 'bg-gradient-to-b from-slate-900 to-indigo-950/50 border-indigo-500 shadow-xl shadow-indigo-900/10'
          : 'bg-slate-900/50 border-slate-800'
  }`}>
    {isCurrentPlan && (
      <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
          <CheckCircle size={20} fill="currentColor" className="text-green-900" />
        </div>
      </div>
    )}

    {popular && !isCurrentPlan && (
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg">
        <Star size={12} fill="currentColor" /> Most Popular
      </div>
    )}
    
    {bestValue && !isCurrentPlan && (
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg">
        <Zap size={12} fill="currentColor" /> Best Value
      </div>
    )}
    
    <div className="mb-8">
      <h3 className={`text-xl font-semibold mb-2 ${popular ? 'text-purple-400' : 'text-slate-200'}`}>{name}</h3>
      <div className="flex items-baseline space-x-1">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-slate-500">{period}</span>
      </div>
    </div>

    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feat, i) => (
        <li key={i} className="flex items-start space-x-3 text-slate-300 text-sm">
          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${popular ? 'bg-purple-500/20' : 'bg-slate-700/50'}`}>
             <Check size={10} className={popular ? "text-purple-400" : "text-slate-400"} />
          </div>
          <span className={feat.includes("WonderCoins") ? "font-bold text-yellow-400" : ""}>{feat}</span>
        </li>
      ))}
    </ul>

    <button 
      onClick={isCurrentPlan ? undefined : onSelect}
      disabled={isCurrentPlan}
      className={`w-full py-4 rounded-xl font-bold text-center transition-all shadow-lg flex items-center justify-center gap-2 ${
        isCurrentPlan
          ? 'bg-green-600/20 text-green-400 border border-green-500/50 cursor-default'
          : popular 
            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/50' 
            : bestValue
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
      }`}
    >
      {isCurrentPlan ? (
        <>
          <CheckCircle size={18} />
          <span>Active Plan</span>
        </>
      ) : cta}
    </button>
  </div>
);

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPlanType, setCurrentPlanType] = useState<string>('free'); // Default to free
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile details for name AND current plan
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        setCurrentUser({
            email: user.email,
            name: profile?.full_name || ''
        });

        if (profile?.plan_type) {
            setCurrentPlanType(profile.plan_type.toLowerCase());
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSelectPlan = (name: string, price: string) => {
    if (name === "Free Starter") {
      navigate(AppRoute.IMAGE_DASHBOARD);
      return;
    }
    
    // --- AUTH GUARD ---
    if (!currentUser) {
      navigate(AppRoute.LOGIN);
      return;
    }

    setSelectedPlan({ name, price });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <CheckoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        userEmail={currentUser?.email}
        userName={currentUser?.name}
      />

      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Start creating for free, upgrade for power. Choose the plan that fits your creative journey.
        </p>
        
        {!currentUser && !loading && (
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/50 rounded-full text-purple-200 text-sm animate-pulse">
             <LogIn size={14} />
             <span>Sign in required to purchase plans</span>
           </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* FREE TIER */}
        <PricingCard 
          name="Free Starter"
          price="₹0"
          period="/month"
          cta="Start Creating"
          isCurrentPlan={currentPlanType === 'free' || !currentPlanType}
          onSelect={() => handleSelectPlan("Free Starter", "₹0")}
          features={[
            "💰 500 WonderCoins (One-time)",
            "5 Image generations / day",
            "Veo Video Generation (BYO Key)",
            "Watermarked results",
            "Basic caption generation",
            "Community support",
            "Access to Trending page"
          ]}
        />
        
        {/* MONTHLY TIER */}
        <PricingCard 
          name="Creator Monthly"
          price="₹1,699"
          period="/month"
          popular={true}
          cta={currentUser ? "Upgrade Monthly" : "Sign In to Upgrade"}
          isCurrentPlan={currentPlanType === 'monthly'}
          onSelect={() => handleSelectPlan("Creator Monthly", "₹1,699")}
          features={[
            "💰 5,000 WonderCoins / mo",
            "Unlimited Image generations",
            "No watermarks",
            "Priority Veo Video generation",
            "Advanced Motion Clone tools",
            "Commercial usage rights",
            "Priority support"
          ]}
        />

        {/* YEARLY TIER */}
        <PricingCard 
          name="Creator Yearly"
          price="₹1,999"
          period="/year"
          bestValue={true}
          cta={currentUser ? "Upgrade Yearly" : "Sign In to Upgrade"}
          isCurrentPlan={currentPlanType === 'yearly'}
          onSelect={() => handleSelectPlan("Creator Yearly", "₹1,999")}
          features={[
            "💰 60,000 WonderCoins / yr",
            "Everything in Monthly",
            "Save 90% vs Monthly",
            "Team seats (up to 5)",
            "API Access",
            "Custom branding",
            "Dedicated account manager",
            "Early access to new models"
          ]}
        />
      </div>
      
      <div className="mt-16 text-center text-slate-500 text-sm">
        <p>Secured by Razorpay. Cancel anytime.</p>
      </div>
    </div>
  );
};

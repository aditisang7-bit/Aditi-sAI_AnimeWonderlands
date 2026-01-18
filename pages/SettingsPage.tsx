import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Shield, Zap, CreditCard, Save, Loader2, LogIn, Coins, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppRoute } from '../types';

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfile(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name })
        .eq('id', profile.id);

      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <User className="text-purple-400" /> Personal Information
             </h2>
             
             <form onSubmit={handleUpdate} className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Email Address</label>
                 <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400 cursor-not-allowed">
                   <Mail size={16} className="mr-3" />
                   {profile?.email}
                 </div>
                 <p className="text-xs text-slate-600 mt-2">Email cannot be changed manually.</p>
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Full Name</label>
                 <input 
                   type="text" 
                   value={profile?.full_name || ''}
                   onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
                 />
               </div>

               <div className="pt-4">
                 <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                   <span>Save Changes</span>
                 </button>
                 {message && <p className="mt-4 text-green-400 text-sm">{message}</p>}
               </div>
             </form>
          </div>

          {/* Wallet Section (New) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <Coins className="text-yellow-400" /> Wallet & Credits
             </h2>
             
             <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                 <div className="flex items-center gap-3">
                     <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400">
                         <Coins size={24} />
                     </div>
                     <div>
                         <p className="text-xs text-slate-400 uppercase font-bold">Current Balance</p>
                         <p className="text-2xl font-black text-white">{profile?.coins?.toLocaleString() || 0} WC</p>
                     </div>
                 </div>
                 <Link to={AppRoute.PRICING} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors">
                     Add Funds
                 </Link>
             </div>

             <div className="space-y-3">
                 <p className="text-xs font-bold text-slate-500 uppercase">Recent Activity</p>
                 {/* Mock Transactions */}
                 <div className="flex justify-between items-center text-sm p-3 bg-slate-950/50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-300">
                        <History size={14} className="text-slate-500" />
                        <span>Daily Login Bonus</span>
                    </div>
                    <span className="text-green-400 font-bold">+250 WC</span>
                 </div>
                 <div className="flex justify-between items-center text-sm p-3 bg-slate-950/50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-300">
                        <History size={14} className="text-slate-500" />
                        <span>Registration Bonus</span>
                    </div>
                    <span className="text-green-400 font-bold">+500 WC</span>
                 </div>
             </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-900/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400" /> Subscription
            </h2>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-indigo-500/30 mb-6">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Current Plan</p>
              <p className={`text-2xl font-bold ${profile?.is_pro ? 'text-yellow-400' : 'text-white'}`}>
                {profile?.is_pro ? 'Pro Creator' : 'Free Starter'}
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-sm text-slate-300">
                <Shield size={16} className="text-green-400 mr-2" />
                {profile?.is_pro ? 'Commercial License Active' : 'Personal License'}
              </li>
              <li className="flex items-center text-sm text-slate-300">
                <CreditCard size={16} className="text-blue-400 mr-2" />
                {profile?.is_pro ? 'Next billing: Aug 25, 2025' : 'No active billing'}
              </li>
            </ul>

            {!profile?.is_pro && (
              <Link to={AppRoute.PRICING} className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-center text-white font-bold rounded-xl transition-colors">
                Upgrade Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
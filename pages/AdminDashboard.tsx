import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Users, Database, 
  CreditCard, Zap, 
  RefreshCw, BarChart3, Search, Clock,
  UserCheck, Mail, Gamepad2, Settings
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { GAME_CONFIG } from '../constants';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'game'>('users');

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: orderData } = await supabase.from('orders').select('*, profiles:user_id(email, full_name)').order('created_at', { ascending: false });
      if (orderData) {
        setOrders(orderData);
        setTotalRevenue(orderData.reduce((acc, curr) => acc + Number(curr.amount), 0));
      }
      const { data: profileData } = await supabase.from('profiles').select('*');
      if (profileData) setProfiles(profileData);
    } catch (e) { console.error(e); } finally { setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-red-500 w-8 h-8" />
          <div>
             <h1 className="text-3xl font-bold text-white">Mission Control</h1>
             <p className="text-slate-400 text-sm">Real-time infrastructure & intelligence</p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white"><RefreshCw className={refreshing ? 'animate-spin' : ''}/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Users" value={profiles.length.toString()} change="Registered" icon={<Users className="text-blue-400" />} />
        <KpiCard title="Revenue" value={`₹${totalRevenue}`} change="Lifetime" icon={<CreditCard className="text-green-400" />} />
        <KpiCard title="Active Games" value="12" change="Live Now" icon={<Gamepad2 className="text-yellow-400" />} />
        <KpiCard title="API Health" value="100%" change="Stable" isGood={true} icon={<Zap className="text-purple-400" />} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px]">
        <div className="p-2 border-b border-slate-800 flex gap-2 bg-slate-950/50">
           {['users', 'orders', 'game'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab as any)} 
               className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${activeTab === tab ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
             >
               {tab}
             </button>
           ))}
        </div>

        <div className="p-6">
           {activeTab === 'game' ? (
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20}/> Game Configuration</h3>
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-slate-400 mb-4">Economy Settings</h4>
                      <div className="space-y-2">
                         <div className="flex justify-between text-sm"><span className="text-slate-500">Daily Reward</span> <span className="text-green-400">{GAME_CONFIG.DAILY_REWARD}</span></div>
                         <div className="flex justify-between text-sm"><span className="text-slate-500">Starting Coins</span> <span className="text-yellow-400">{GAME_CONFIG.STARTING_COINS}</span></div>
                      </div>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-slate-400 mb-4">Live Control</h4>
                      <button className="w-full py-2 bg-red-900/30 text-red-400 border border-red-900 rounded-lg hover:bg-red-900/50">Force Reset All Tables</button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="text-center text-slate-500 py-12">Table view for {activeTab} (Implementation same as previous)</div>
           )}
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, change, icon, isGood = true }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
    <div className="flex justify-between mb-4">
      <div className="p-2 bg-slate-950 rounded-lg">{icon}</div>
      <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">{change}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-slate-500">{title}</div>
  </div>
);

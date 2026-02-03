import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Users, Database, 
  CreditCard, Zap, 
  RefreshCw, BarChart3, Search, Clock,
  UserCheck, Mail, Gamepad2, Settings,
  CheckCircle, XCircle, MessageSquare, Star
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { GAME_CONFIG } from '../constants';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'game' | 'feedback'>('users');

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: orderData } = await supabase.from('orders').select('*, profiles:user_id(email, full_name)').order('created_at', { ascending: false });
      if (orderData) {
        setOrders(orderData);
        setTotalRevenue(orderData.reduce((acc, curr) => acc + Number(curr.amount), 0));
      }
      const { data: profileData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profileData) setProfiles(profileData);

      const { data: feedbackData } = await supabase.from('feedbacks').select('*, profiles:user_id(email, full_name)').order('created_at', { ascending: false });
      if (feedbackData) setFeedbacks(feedbackData);

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
        <KpiCard title="Feedback" value={feedbacks.length.toString()} change="New" icon={<MessageSquare className="text-purple-400" />} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px]">
        <div className="p-2 border-b border-slate-800 flex gap-2 bg-slate-950/50">
           {['users', 'orders', 'game', 'feedback'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab as any)} 
               className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${activeTab === tab ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
             >
               {tab}
             </button>
           ))}
        </div>

        <div className="p-0">
           {activeTab === 'users' && (
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                       <tr>
                          <th className="p-4 border-b border-slate-800">User</th>
                          <th className="p-4 border-b border-slate-800">Email</th>
                          <th className="p-4 border-b border-slate-800">Plan</th>
                          <th className="p-4 border-b border-slate-800">Coins</th>
                          <th className="p-4 border-b border-slate-800">Joined</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {profiles.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                             <td className="p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                   {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-200 text-sm">{user.full_name || 'Unknown'}</span>
                             </td>
                             <td className="p-4 text-sm text-slate-400">{user.email}</td>
                             <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.is_pro ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-500'}`}>
                                   {user.plan_type || 'FREE'}
                                </span>
                             </td>
                             <td className="p-4 font-mono text-yellow-400 text-sm">{user.coins?.toLocaleString()}</td>
                             <td className="p-4 text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                          </tr>
                       ))}
                       {profiles.length === 0 && (
                          <tr>
                             <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           )}

           {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                       <tr>
                          <th className="p-4 border-b border-slate-800">Order ID</th>
                          <th className="p-4 border-b border-slate-800">Customer</th>
                          <th className="p-4 border-b border-slate-800">Amount</th>
                          <th className="p-4 border-b border-slate-800">Plan</th>
                          <th className="p-4 border-b border-slate-800">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                             <td className="p-4 text-xs font-mono text-slate-500">{order.payment_id}</td>
                             <td className="p-4 text-sm text-slate-300">{order.profiles?.email || 'Unknown'}</td>
                             <td className="p-4 font-bold text-white">₹{order.amount}</td>
                             <td className="p-4 text-xs uppercase text-slate-400">{order.plan_id}</td>
                             <td className="p-4">
                                <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
                                   <CheckCircle size={12} /> {order.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                       {orders.length === 0 && (
                          <tr>
                             <td colSpan={5} className="p-8 text-center text-slate-500">No transactions recorded yet.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           )}

           {activeTab === 'feedback' && (
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                       <tr>
                          <th className="p-4 border-b border-slate-800 w-1/4">User</th>
                          <th className="p-4 border-b border-slate-800 w-1/6">Tool</th>
                          <th className="p-4 border-b border-slate-800 w-1/6">Rating</th>
                          <th className="p-4 border-b border-slate-800">Comment</th>
                          <th className="p-4 border-b border-slate-800 w-1/6">Date</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {feedbacks.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/50 transition-colors align-top">
                             <td className="p-4">
                                <div className="font-bold text-white text-sm">{item.profiles?.full_name || 'Guest'}</div>
                                <div className="text-xs text-slate-500">{item.profiles?.email}</div>
                             </td>
                             <td className="p-4 text-sm text-slate-300 font-bold">{item.tool_used}</td>
                             <td className="p-4">
                                <div className="flex text-yellow-400">
                                   {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={14} fill={i < item.rating ? "currentColor" : "none"} className={i < item.rating ? "" : "text-slate-700"} />
                                   ))}
                                </div>
                             </td>
                             <td className="p-4 text-sm text-slate-400 italic">"{item.comment || 'No comment'}"</td>
                             <td className="p-4 text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                          </tr>
                       ))}
                       {feedbacks.length === 0 && (
                          <tr>
                             <td colSpan={5} className="p-8 text-center text-slate-500">No feedback received yet.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           )}

           {activeTab === 'game' && (
             <div className="p-6 space-y-6">
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
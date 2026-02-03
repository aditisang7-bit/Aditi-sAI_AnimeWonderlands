import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppRoute } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { ADMIN_EMAIL } from './constants';
import { Loader2, Gamepad2 } from 'lucide-react';
import { SEO } from './components/SEO';

// --- Lazy Load Pages ---
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const FutureSelfPage = lazy(() => import('./pages/FutureSelfPage').then(m => ({ default: m.FutureSelfPage })));
const SocialPage = lazy(() => import('./pages/SocialPage').then(m => ({ default: m.SocialPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const TrendingPage = lazy(() => import('./pages/TrendingPage').then(m => ({ default: m.TrendingPage })));
const ImageTools = lazy(() => import('./pages/ImageTools').then(m => ({ default: m.ImageTools })));
const VideoTools = lazy(() => import('./pages/VideoTools').then(m => ({ default: m.VideoTools })));
const DocumentTools = lazy(() => import('./pages/DocumentTools').then(m => ({ default: m.DocumentTools })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));

// Legal Pages (Grouped)
const PrivacyPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.TermsPage })));
const AboutPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.ContactPage })));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <Loader2 className="animate-spin text-purple-500 w-10 h-10 mb-4" />
    <p className="text-slate-500 text-sm font-medium animate-pulse">Loading Experience...</p>
  </div>
);

const ProtectedRoute = ({ children, requireAdmin = false }: { children?: React.ReactNode, requireAdmin?: boolean }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      // Check Supabase Session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
      </div>
    );
  }

  // Strictly require session (No Guest Mode)
  if (!session) {
     return <Navigate to={AppRoute.LOGIN} replace />;
  }

  if (requireAdmin) {
      if (!session || session.user.email !== ADMIN_EMAIL) {
         return <Navigate to={AppRoute.HOME} replace />;
      }
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path={AppRoute.HOME} element={<LandingPage />} />
            <Route path={AppRoute.LOGIN} element={<><SEO title="Login - Aditi's AI" /><AuthPage /></>} />
            <Route path={AppRoute.REGISTER} element={<><SEO title="Register - Aditi's AI" /><AuthPage /></>} />
            
            {/* Legal & Public Info */}
            <Route path={AppRoute.PRIVACY} element={<><SEO title="Privacy Policy - Aditi's AI" /><PrivacyPage /></>} />
            <Route path={AppRoute.TERMS} element={<><SEO title="Terms of Service - Aditi's AI" /><TermsPage /></>} />
            <Route path={AppRoute.ABOUT} element={<><SEO title="About Aditi's AI - Pune Based AI Startup" description="Learn about Aditi's AI, the Thergaon, Pune based startup revolutionizing Anime AI tools." /><AboutPage /></>} />
            <Route path={AppRoute.CONTACT} element={<><SEO title="Contact Us - Aditi's AI" /><ContactPage /></>} />

            {/* Core Modules (Protected) */}
            <Route path={AppRoute.GAME_LUDO} element={
              <div className="min-h-screen bg-[#0f0e17] flex flex-col items-center justify-center text-white p-4 text-center">
                  <SEO title="Anime Ludo - Coming Soon" />
                  <div className="p-4 bg-slate-800 rounded-full mb-4 opacity-50"><Gamepad2 size={48} /></div>
                  <h1 className="text-3xl font-bold mb-2">Anime Ludo is Coming Soon</h1>
                  <p className="text-slate-400 max-w-md">We are polishing the dice physics and anime avatars. Stay tuned!</p>
                  <Link to={AppRoute.HOME} className="mt-8 px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors font-bold">Return Home</Link>
              </div>
            } />
            <Route path={AppRoute.FUTURE_SELF} element={<ProtectedRoute><SEO title="Future Self AI - Visualize Success" description="Upload a photo and see your future self as a successful anime character." /><FutureSelfPage /></ProtectedRoute>} />
            <Route path={AppRoute.SOCIAL_FEED} element={<ProtectedRoute><SEO title="Wonder Feed - Community Creations" /><SocialPage /></ProtectedRoute>} />
            <Route path={AppRoute.IMAGE_DASHBOARD} element={<ProtectedRoute><SEO title="AI Image Studio - Generate Anime Art" description="Professional AI Image Generator. Create Logos, Anime Art, and Realistic Photos." /><ImageTools /></ProtectedRoute>} />
            <Route path={AppRoute.VIDEO_TOOLS} element={<ProtectedRoute><SEO title="AI Video Studio - Create Viral Videos" /><VideoTools /></ProtectedRoute>} />
            <Route path={AppRoute.DOC_TOOLS} element={<ProtectedRoute><SEO title="Document AI - Summarizer & Solver" /><DocumentTools /></ProtectedRoute>} />
            <Route path={AppRoute.AI_ASSISTANT} element={<ProtectedRoute><SEO title="Wonder Chat - AI Assistant" /><ChatPage /></ProtectedRoute>} />
            
            {/* Legacy/Support Routes */}
            <Route path={AppRoute.TRENDING} element={<ProtectedRoute><SEO title="Trending AI Art - Aditi's AI" /><TrendingPage /></ProtectedRoute>} />
            <Route path={AppRoute.PRICING} element={<ProtectedRoute><SEO title="Pricing - Upgrade to Pro" /><PricingPage /></ProtectedRoute>} />
            <Route path={AppRoute.PAYMENT_SUCCESS} element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
            <Route path={AppRoute.SETTINGS} element={<ProtectedRoute><SEO title="Account Settings" /><SettingsPage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path={AppRoute.ADMIN} element={<ProtectedRoute requireAdmin={true}><SEO title="Admin Console" /><AdminDashboard /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to={AppRoute.HOME} replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
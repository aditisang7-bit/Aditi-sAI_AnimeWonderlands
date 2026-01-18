import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LudoPage } from './pages/LudoPage';
import { FutureSelfPage } from './pages/FutureSelfPage';
import { SocialPage } from './pages/SocialPage';
import { PricingPage } from './pages/PricingPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { SettingsPage } from './pages/SettingsPage';
import { TrendingPage } from './pages/TrendingPage';
import { ImageTools } from './pages/ImageTools';
import { VideoTools } from './pages/VideoTools';
import { DocumentTools } from './pages/DocumentTools';
import { PrivacyPage, TermsPage, AboutPage, ContactPage } from './pages/LegalPages';
import { AppRoute } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { ADMIN_EMAIL } from './constants';
import { Loader2, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }: { children?: React.ReactNode, requireAdmin?: boolean }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check for supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
      </div>
    );
  }

  // If Supabase is not configured, we redirect to Login (which shows an error) or allow demo access if desired.
  // For strict protection, we redirect to login.
  if (!isSupabaseConfigured) {
     return <Navigate to={AppRoute.LOGIN} replace />;
  }

  if (!session) {
    return <Navigate to={AppRoute.LOGIN} replace />;
  }

  if (requireAdmin && (!session || session.user.email !== ADMIN_EMAIL)) {
    return <Navigate to={AppRoute.HOME} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path={AppRoute.HOME} element={<LandingPage />} />
          <Route path={AppRoute.LOGIN} element={<AuthPage />} />
          <Route path={AppRoute.REGISTER} element={<AuthPage />} />
          
          {/* Legal & Public Info */}
          <Route path={AppRoute.PRIVACY} element={<PrivacyPage />} />
          <Route path={AppRoute.TERMS} element={<TermsPage />} />
          <Route path={AppRoute.ABOUT} element={<AboutPage />} />
          <Route path={AppRoute.CONTACT} element={<ContactPage />} />

          {/* Core Modules (Protected) */}
          <Route path={AppRoute.GAME_LUDO} element={<ProtectedRoute><LudoPage /></ProtectedRoute>} />
          <Route path={AppRoute.FUTURE_SELF} element={<ProtectedRoute><FutureSelfPage /></ProtectedRoute>} />
          <Route path={AppRoute.SOCIAL_FEED} element={<ProtectedRoute><SocialPage /></ProtectedRoute>} />
          <Route path={AppRoute.IMAGE_DASHBOARD} element={<ProtectedRoute><ImageTools /></ProtectedRoute>} />
          <Route path={AppRoute.VIDEO_TOOLS} element={<ProtectedRoute><VideoTools /></ProtectedRoute>} />
          <Route path={AppRoute.DOC_TOOLS} element={<ProtectedRoute><DocumentTools /></ProtectedRoute>} />
          
          {/* Legacy/Support Routes */}
          <Route path={AppRoute.TRENDING} element={<ProtectedRoute><TrendingPage /></ProtectedRoute>} />
          <Route path={AppRoute.PRICING} element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
          <Route path={AppRoute.PAYMENT_SUCCESS} element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
          <Route path={AppRoute.SETTINGS} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path={AppRoute.ADMIN} element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to={AppRoute.HOME} replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
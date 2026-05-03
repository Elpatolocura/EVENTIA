import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import NotificationManager from "@/components/NotificationManager";
import ThemeHandler from "@/components/ThemeHandler";
import BackButtonHandler from "@/components/BackButtonHandler";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Lazy loaded components for better performance
const HomePage = lazy(() => import("@/pages/HomePage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));
const EventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const CreateEventPage = lazy(() => import("@/pages/CreateEventPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const MyTicketsPage = lazy(() => import("@/pages/MyTicketsPage"));
const TicketDetailsPage = lazy(() => import("@/pages/TicketDetailsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const KnowledgeBasePage = lazy(() => import("./pages/KnowledgeBasePage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const MyEventsPage = lazy(() => import("@/pages/MyEventsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const ChatRoomPage = lazy(() => import("@/pages/ChatRoomPage"));
const PremiumPage = lazy(() => import("@/pages/PremiumPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const SubscriptionCheckoutPage = lazy(() => import("@/pages/SubscriptionCheckoutPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const FollowsPage = lazy(() => import("@/pages/FollowsPage"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Routes location={location}>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/welcome" element={<WelcomePage />} />

              {/* Rutas Protegidas */}
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
              <Route path="/event/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
              <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetailsPage /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
              <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>} />
              <Route path="/checkout/:id" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/u/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/:type" element={<ProtectedRoute><FollowsPage /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
              <Route path="/premium" element={<ProtectedRoute><PremiumPage /></ProtectedRoute>} />
              <Route path="/subscribe/:planId" element={<ProtectedRoute><SubscriptionCheckoutPage /></ProtectedRoute>} />
              <Route path="/terms" element={<ProtectedRoute><LegalPage /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/my-events" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </Suspense>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" duration={2000} closeButton richColors />
      <BrowserRouter>
        <BackButtonHandler />
        <NotificationManager />
        <ThemeHandler />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

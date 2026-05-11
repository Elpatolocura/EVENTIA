import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import BottomNav from "@/components/BottomNav";
import DesktopSidebar from "@/components/DesktopSidebar";
import NotificationManager from "@/components/NotificationManager";
import ThemeHandler from "@/components/ThemeHandler";
import BackButtonHandler from "@/components/BackButtonHandler";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const HomePage = lazy(() => import("@/pages/HomePage"));
const EventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const CreateEventPage = lazy(() => import("@/pages/CreateEventPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const WelcomePage = lazy(() => import("@/pages/WelcomePage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const MyTicketsPage = lazy(() => import("@/pages/MyTicketsPage"));
const TicketDetailsPage = lazy(() => import("@/pages/TicketDetailsPage"));
const SupportPage = lazy(() => import("@/pages/SupportPage"));
const KnowledgeBasePage = lazy(() => import("@/pages/KnowledgeBasePage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const MyEventsPage = lazy(() => import("@/pages/MyEventsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const ChatRoomPage = lazy(() => import("@/pages/ChatRoomPage"));
const PremiumPage = lazy(() => import("@/pages/PremiumPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const ChatRoomSettingsPage = lazy(() => import("@/pages/ChatRoomSettingsPage"));
const SubscriptionCheckoutPage = lazy(() => import("@/pages/SubscriptionCheckoutPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const FollowsPage = lazy(() => import("@/pages/FollowsPage"));
const ReportPage = lazy(() => import("@/pages/ReportPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center pb-24">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" duration={2000} closeButton richColors />
          <BrowserRouter>
            <BackButtonHandler />
            <NotificationManager />
            <ThemeHandler />
            <DesktopSidebar />
            <div className="app-container">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/event/:id" element={<EventDetailPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat-settings/:id" element={<ChatRoomSettingsPage />} />
                  <Route path="/report/event/:id" element={<ReportPage />} />
                  <Route path="/chat/:id" element={<ChatRoomPage />} />
                  <Route path="/ticket/:id" element={<TicketDetailsPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                  <Route path="/checkout/:id" element={<CheckoutPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/u/:id" element={<ProfilePage />} />
                  <Route path="/profile/:type" element={<FollowsPage />} />
                  <Route path="/profile/edit" element={<EditProfilePage />} />
                  <Route path="/premium" element={<PremiumPage />} />
                  <Route path="/subscribe/:planId" element={<SubscriptionCheckoutPage />} />
                  <Route path="/terms" element={<LegalPage />} />
                  <Route path="/create" element={<CreateEventPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/welcome" element={<WelcomePage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/tickets" element={<MyTicketsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/my-events" element={<MyEventsPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <BottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

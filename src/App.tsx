import React, { Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import NotificationManager from "@/components/NotificationManager";
import ThemeHandler from "@/components/ThemeHandler";


const HomePage = lazy(() => import('@/pages/HomePage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const CreateEventPage = lazy(() => import('@/pages/CreateEventPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const MyTicketsPage = lazy(() => import('@/pages/MyTicketsPage'));
const TicketDetailsPage = lazy(() => import('@/pages/TicketDetailsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const MyEventsPage = lazy(() => import('@/pages/MyEventsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const EditProfilePage = lazy(() => import('@/pages/EditProfilePage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const ChatRoomPage = lazy(() => import('@/pages/ChatRoomPage'));
const PremiumPage = lazy(() => import('@/pages/PremiumPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const SubscriptionCheckoutPage = lazy(() => import('@/pages/SubscriptionCheckoutPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const FollowsPage = lazy(() => import('@/pages/FollowsPage'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Algo salió mal</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || 'Error desconocido'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" duration={2000} closeButton richColors />
      <BrowserRouter>
        <NotificationManager />
        <ThemeHandler />
        <div className="app-container">
          <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/chat" element={<ChatPage />} />
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
   </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

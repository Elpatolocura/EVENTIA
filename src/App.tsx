import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import NotificationManager from "@/components/NotificationManager";
import ThemeHandler from "@/components/ThemeHandler";
import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import EventDetailPage from "@/pages/EventDetailPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";
import CreateEventPage from "@/pages/CreateEventPage";
import AuthPage from "@/pages/AuthPage";
import WelcomePage from "./pages/WelcomePage";
import OnboardingPage from "@/pages/OnboardingPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import MyTicketsPage from "@/pages/MyTicketsPage";
import TicketDetailsPage from "@/pages/TicketDetailsPage";
import SupportPage from './pages/SupportPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import NotificationsPage from "@/pages/NotificationsPage";
import MyEventsPage from "@/pages/MyEventsPage";
import SettingsPage from "@/pages/SettingsPage";
import EditProfilePage from "@/pages/EditProfilePage";
import FavoritesPage from "@/pages/FavoritesPage";
import ChatRoomPage from "@/pages/ChatRoomPage";
import PremiumPage from "@/pages/PremiumPage";
import CheckoutPage from "@/pages/CheckoutPage";
import SubscriptionCheckoutPage from "@/pages/SubscriptionCheckoutPage";
import LegalPage from "@/pages/LegalPage";
import FollowsPage from "@/pages/FollowsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" duration={2000} closeButton richColors />
        <BrowserRouter>
          <BackButtonHandler />
          <NotificationManager />
          <ThemeHandler />
          <div className="app-container">
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
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import { MessageToast } from "@/components/message-toast";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login/page";
import RegisterPage from "@/pages/register/page";
import DashboardPage from "@/pages/dashboard/page";
import MarketplacePage from "@/pages/marketplace/page";
import NewListingPage from "@/pages/new-listing/page";
import DiseaseDetectorPage from "@/pages/disease-detector/page";
import PricesPage from "@/pages/prices/page";
import ListingDetailPage from "@/pages/listing/page";
import FarmerProfilePage from "@/pages/farmer/page";
import OrdersPage from "@/pages/orders/page";
import MessagesPage from "@/pages/messages/page";
import CropCalendarPage from "@/pages/crop-calendar/page";
import LivestockPage from "@/pages/livestock/page";
import LivestockDoctorPage from "@/pages/livestock-doctor/page";
import SubscriptionPage from "@/pages/subscription/page";
import ProfilePage from "@/pages/profile/page";
import HowItWorksPage from "@/pages/how-it-works";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import RefundPage from "@/pages/refund";
import CookiesPage from "@/pages/cookies";
import AnimalDoctorPage from "@/pages/animal-doctor/page"
import PriceAlertsPage from "@/pages/price-alerts/page";
import TrackingPage from "@/pages/tracking/page";
import AdminReportsPage from "@/pages/admin/reports";

const queryClient = new QueryClient();

// Scroll to top on every route change
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/livestock" component={LivestockPage} />
        <Route path="/livestock-doctor" component={LivestockDoctorPage} />
        <Route path="/new-listing" component={NewListingPage} />
        <Route path="/disease-detector" component={DiseaseDetectorPage} />
        <Route path="/prices" component={PricesPage} />
        <Route path="/listing/:id" component={ListingDetailPage} />
        <Route path="/farmer/:id" component={FarmerProfilePage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/crop-calendar" component={CropCalendarPage} />
        <Route path="/subscription" component={SubscriptionPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/refund" component={RefundPage} />
        <Route path="/cookies" component={CookiesPage} />
        <Route path="/animal-doctor" component={AnimalDoctorPage} />
        <Route path="/price-alerts" component={PriceAlertsPage} />
        <Route path="/track/:token" component={TrackingPage} />
        <Route path="/admin/reports" component={AdminReportsPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
              <MessageToast />
            </WouterRouter>
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
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
import AdminPage from "@/pages/admin/page";

const queryClient = new QueryClient();

function Router() {
  return (
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
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

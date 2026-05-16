import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import CustomerDashboard from "./pages/CustomerDashboard";
import FindTradespeople from "./pages/FindTradespeople";
import ReviewsReputation from "./pages/ReviewsReputation";
import Support from "./pages/Support";
import TradeRegistration from "./pages/TradeRegistration";
import CustomerRegistration from "./pages/CustomerRegistration";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import Trades from "./pages/Trades";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Plumbers from "./pages/Plumbers";
import Electricians from "./pages/Electricians";
import Builders from "./pages/Builders";
import Roofers from "./pages/Roofers";
import { DemoModeBanner } from "./components/DemoModeBanner";
import TradeCRMLayout from "./layouts/TradeCRMLayout";
import Dashboard from "./pages/trade-crm/Dashboard";
import JobMarket from "./pages/trade-crm/JobMarket";
import MyJobs from "./pages/trade-crm/MyJobs";
import MyLeads from "./pages/trade-crm/MyLeads";
import Credits from "./pages/trade-crm/Credits";
import CreditSuccess from "./pages/trade-crm/CreditSuccess";
import TradeCRMProfile from "./pages/trade-crm/TradeCRMProfile";
import TradeSupport from "./pages/trade-crm/TradeSupport";
import AccountSettings from "./pages/trade-crm/AccountSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <DemoModeBanner /> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/plumbers" element={<Plumbers />} />
          <Route path="/electricians" element={<Electricians />} />
          <Route path="/builders" element={<Builders />} />
          <Route path="/roofers" element={<Roofers />} />
          <Route path="/find-tradespeople" element={<FindTradespeople />} />
          <Route path="/trades-crm" element={<TradeCRMLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="job-market" element={<JobMarket />} />
            <Route path="jobs" element={<MyJobs />} />
            <Route path="leads" element={<MyLeads />} />
            <Route path="credits" element={<Credits />} />
            <Route path="credits/success" element={<CreditSuccess />} />
            <Route path="profile" element={<TradeCRMProfile />} />
            <Route path="account-settings" element={<AccountSettings />} />
            <Route path="support" element={<TradeSupport />} />
          </Route>
          <Route path="/reviews-reputation" element={<ReviewsReputation />} />
          <Route path="/support" element={<Support />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/trades/join" element={<TradeRegistration />} />
          <Route path="/join" element={<CustomerRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

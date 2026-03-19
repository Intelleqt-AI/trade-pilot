import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CustomerDashboard from "./pages/CustomerDashboard";
import FindTradespeople from "./pages/FindTradespeople";
import TradesCRM from "./pages/TradesCRM";
import ReviewsReputation from "./pages/ReviewsReputation";
import Support from "./pages/Support";
import TradeRegistration from "./pages/TradeRegistration";
import CustomerRegistration from "./pages/CustomerRegistration";
import Login from "./pages/Login";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DemoModeBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/plumbers" element={<Plumbers />} />
          <Route path="/electricians" element={<Electricians />} />
          <Route path="/builders" element={<Builders />} />
          <Route path="/roofers" element={<Roofers />} />
          <Route path="/find-tradespeople" element={<FindTradespeople />} />
          <Route path="/trades-crm" element={<TradesCRM />} />
          <Route path="/reviews-reputation" element={<ReviewsReputation />} />
          <Route path="/support" element={<Support />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/trades/join" element={<TradeRegistration />} />
          <Route path="/join" element={<CustomerRegistration />} />
          <Route path="/login" element={<Login />} />
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

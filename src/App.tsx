import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Friends from "./pages/Friends";
import Messages from "./pages/Messages";
import Reels from "./pages/Reels";
import Market from "./pages/Market";
import Alerts from "./pages/Alerts";
import Menu from "./pages/Menu";
import Search from "./pages/Search";
import AppShell from "./components/AppShell";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/market" element={<Market />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/search" element={<Search />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
